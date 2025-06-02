from django.http import HttpResponse
from rest_framework import viewsets, status, filters
from .models import *
from .serializers import *
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from django.conf import settings
from django.utils import timezone
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from urllib.parse import unquote, urlencode, quote_plus
import hmac, hashlib
from django_filters.rest_framework import DjangoFilterBackend

class SnackViewSet(viewsets.ModelViewSet):
    queryset = Snack.objects.all()
    serializer_class = SnackSerializer
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return []

class PaymentSeatViewSet(viewsets.ModelViewSet):
    queryset = Ticket.objects.all()
    serializer_class = PaymentTicketSerializer
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return []
    
class PaymentSnackViewSet(viewsets.ModelViewSet):
    queryset = Snack.objects.all()
    serializer_class = PaymentSnackSerializer
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return []

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status']
    ordering_fields = ['created_at']

    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        elif self.action == 'create':
            return [IsAuthenticated()]
        return []

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return PaymentDetailSerializer
        return PaymentSerializer

    def create(self, request, *args, **kwargs):
        user = request.user if request.user.is_authenticated else None
        data = request.data
        seats = data.get('seats', [])
        snacks = data.get('snacks', {})
        showtime_id = data.get('showtime')

        total_price = data.get('total_price', 0)

        payment = Payment.objects.create(
            user=user,
            status='pending',
            total_price=total_price,
        )

        # Đánh dấu ghế đã đặt
        for seat_id in seats:
            seat_status = SeatStatus.objects.get(showtime_id=showtime_id, seat_id=seat_id)
            if seat_status.status == 'booked':
                return Response({"error": f"Ghế {seat_id} đã được đặt cho suất chiếu này"}, status=400)
            seat_status.status = 'booked'
            seat_status.save()

            Ticket.objects.create(
                payment=payment,
                seat_id=seat_id,
                showtime_id=showtime_id
            )

        for item in snacks:
            snack_id = item.get('snack')
            quantity = item.get('quantity')
            if snack_id and quantity:
                snack = Snack.objects.get(id=snack_id)
                PaymentSnack.objects.create(
                    payment=payment, 
                    snack=snack, 
                    quantity=quantity
                )

        serializer = PaymentSerializer(payment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def cancel(self, request, pk=None):
        try:
            payment = self.get_object()

            for ticket in payment.tickets.all():
                seat_status = SeatStatus.objects.get(showtime=ticket.showtime, seat=ticket.seat)
                seat_status.status = 'available'
                seat_status.save()

            payment.status = 'canceled'
            payment.save()

            return Response({'detail': 'Payment canceled and seats released.'}, status=status.HTTP_200_OK)
        except SeatStatus.DoesNotExist:
            return Response({'error': 'SeatStatus not found.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'], url_path='user-payments', permission_classes=[IsAuthenticated])
    def user_payments(self, request):
        payments = Payment.objects.filter(user=request.user, status='paid').order_by('-created_at')
        serializer = PaymentDetailSerializer(payments, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['POST'])
def create_vnpay_payment(request):
    payment_id = request.data.get('payment_id')
    if not payment_id:
        return Response({'error': 'payment_id is required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        payment = Payment.objects.get(id=payment_id)
    except Payment.DoesNotExist:
        return Response({'error': 'Payment not found'}, status=status.HTTP_404_NOT_FOUND)

    order_id = str(payment.id)
    amount = int(payment.total_price) * 100  # VNPay yêu cầu đơn vị là VND * 100
    order_desc = f'Thanh toan ve xem phim {order_id}'
    order_type = 'billpayment'
    locale = 'vn'
    ip_addr = request.META.get('REMOTE_ADDR', '127.0.0.1')
    create_date = timezone.now().strftime('%Y%m%d%H%M%S')

    vnp_params = {
        'vnp_Version': '2.1.0',
        'vnp_Command': 'pay',
        'vnp_TmnCode': settings.VNPAY_TMN_CODE,
        'vnp_Amount': str(amount),
        'vnp_CurrCode': 'VND',
        'vnp_TxnRef': order_id,
        'vnp_OrderInfo': order_desc,
        'vnp_OrderType': order_type,
        'vnp_Locale': locale,
        'vnp_ReturnUrl': settings.VNPAY_RETURN_URL,
        'vnp_IpAddr': ip_addr,
        'vnp_CreateDate': create_date,
        # 'vnp_ExpireDate': expire_date,  # nếu cần thêm
        # 'vnp_BankCode': 'NCB',  # nếu muốn chọn ngân hàng cố định
    }

    # B1: Sort param theo key
    sorted_params = sorted(vnp_params.items())
    
    # B2: Tạo chuỗi dữ liệu để hash (dùng quote_plus để encode khoảng trắng thành +)
    hash_data = '&'.join(f"{k}={quote_plus(v)}" for k, v in sorted_params)

    # B3: Tạo chữ ký HMAC SHA512
    hash_secret = settings.VNPAY_HASH_SECRET.encode('utf-8')
    secure_hash = hmac.new(
        key=hash_secret,
        msg=hash_data.encode('utf-8'),
        digestmod=hashlib.sha512
    ).hexdigest()

    # B4: Tạo query URL
    query_string = urlencode(sorted_params)
    payment_url = f"{settings.VNPAY_URL}?{query_string}&vnp_SecureHash={secure_hash}"

    return Response({'payment_url': payment_url})

@api_view(['GET'])
def vnpay_return(request):
    inputData = request.GET.dict()
    
    vnp_HashSecret = settings.VNPAY_HASH_SECRET
    vnp_SecureHash = inputData.pop('vnp_SecureHash', None)
    vnp_SecureHashType = inputData.pop('vnp_SecureHashType', None)

    sorted_params = sorted(inputData.items())
    hash_data = '&'.join(f"{k}={quote_plus(v)}" for k, v in sorted_params)

    # Hash lại để so sánh
    generated_hash = hmac.new(
        vnp_HashSecret.encode('utf-8'),
        hash_data.encode('utf-8'),
        hashlib.sha512
    ).hexdigest()

    if generated_hash == vnp_SecureHash:
        order_id = inputData.get('vnp_TxnRef')
        response_code = inputData.get('vnp_ResponseCode')

        if response_code == '00':
            try:
                payment = Payment.objects.get(id=order_id)
                payment.status = 'paid'
                payment.save()
                return Response({"status": "success", "message": "Thanh toán thành công"})
            except Payment.DoesNotExist:
                return Response({"status": "error", "message": "Hóa đơn không tồn tại"}, status=404)
        else:
            return Response({"status": "failed", "message": "Thanh toán thất bại"})
    else:
        return Response({"status": "error", "message": "Sai chữ ký"}, status=400)



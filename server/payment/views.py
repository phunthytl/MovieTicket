from rest_framework import viewsets
from .models import *
from .serializers import *
from .momo import create_momo_payment
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.permissions import IsAdminUser

class SnackViewSet(viewsets.ModelViewSet):
    queryset = Snack.objects.all()
    serializer_class = SnackSerializer
    def get_permissions(self):
        if self.action in ['create', 'update', 'destroy']:
            return [IsAdminUser()]
        return []

class PaymentSeatViewSet(viewsets.ModelViewSet):
    queryset = PaymentSeat.objects.all()
    serializer_class = PaymentSeatSerializer
    def get_permissions(self):
        if self.action in ['create', 'update', 'destroy']:
            return [IsAdminUser()]
        return []

class PaymentSnackViewSet(viewsets.ModelViewSet):
    queryset = PaymentSnack.objects.all()
    serializer_class = PaymentSnackSerializer
    def get_permissions(self):
        if self.action in ['create', 'update', 'destroy']:
            return [IsAdminUser()]
        return []

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    def get_permissions(self):
        if self.action in ['create', 'update', 'destroy']:
            return [IsAdminUser()]
        return []

    def get_serializer_class(self):
        if self.action == 'retrieve':  # dùng PaymentDetailSerializer khi gọi chi tiết
            return PaymentDetailSerializer
        return PaymentSerializer

    def create(self, request, *args, **kwargs):
        user = request.user if request.user.is_authenticated else None
        data = request.data
        seats = data.get('seats', [])
        tickets = data.get('tickets', {})  # optional
        snacks = data.get('food', {})

        # 1. Tạo Payment
        payment = Payment.objects.create(user=user, status='pending', total_price=0)

        total = 0

        # 2. Lưu vé + ghế + showtime
        for seat_id in seats:
            price = 70000  # tính theo hàng nếu muốn
            PaymentSeat.objects.create(
                payment=payment,
                seat_id=seat_id,
                showtime_id=data['showtime']
            )
            total += price

        # 3. Lưu đồ ăn
        for snack_id, quantity in snacks.items():
            snack_price = 0  # bạn có thể tính từ DB nếu cần
            PaymentSnack.objects.create(payment=payment, snack_id=snack_id, quantity=quantity)
            total += snack_price * quantity


from rest_framework import viewsets, filters
from .models import *
from .serializers import *
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.permissions import IsAdminUser
from collections import defaultdict

class CinemaClusterViewSet(viewsets.ModelViewSet):
    queryset = CinemaCluster.objects.all()
    serializer_class = CinemaClusterSerializer
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return []

class CinemaViewSet(viewsets.ModelViewSet):
    queryset = Cinema.objects.all()
    serializer_class = CinemaSerializer
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return []

    @action(detail=False, url_path='by-cluster/(?P<cluster_id>[^/.]+)', methods=['get'])
    def by_cluster(self, request, cluster_id=None):
        cinemas = Cinema.objects.filter(cluster_id=cluster_id)
        serializer = self.get_serializer(cinemas, many=True)
        return Response(serializer.data)

class RoomViewSet(viewsets.ModelViewSet):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer

    @action(detail=False, methods=['get'], url_path='by-cinema/(?P<cinema_id>[^/.]+)')
    def by_cinema(self, request, cinema_id=None):
        rooms = Room.objects.filter(cinema_id=cinema_id)
        serializer = self.get_serializer(rooms, many=True)
        return Response(serializer.data)

class SeatViewSet(viewsets.ModelViewSet):
    queryset = Seat.objects.all()
    serializer_class = SeatSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return []

    @action(detail=False, methods=['get'], url_path='by-room/(?P<room_id>[^/.]+)')
    def by_room(self, request, room_id=None):
        seats = Seat.objects.filter(room_id=room_id)
        serializer = self.get_serializer(seats, many=True)
        return Response(serializer.data)

class ShowtimeViewSet(viewsets.ModelViewSet):
    queryset = Showtime.objects.all()
    serializer_class = ShowtimeSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return []

    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['movie', 'date', 'cinema']

    def perform_create(self, serializer):
        # Tạo showtime trước
        showtime = serializer.save()
        
        # Tạo seat status cho tất cả ghế trong phòng showtime
        seats = Seat.objects.filter(room=showtime.room)
        seat_status_objects = [
            SeatStatus(showtime=showtime, seat=seat, status='available')
            for seat in seats
        ]
        SeatStatus.objects.bulk_create(seat_status_objects)

    @action(detail=False, methods=['get'], url_path='grouped')
    def grouped_showtimes(self, request):
        showtimes = self.get_queryset().select_related('movie', 'room__cinema')
        serializer = self.get_serializer(showtimes, many=True)
        data = serializer.data

        grouped = defaultdict(lambda: defaultdict(lambda: defaultdict(list)))

        for item in data:
            movie_name = item['movie_name']
            date = item['date']
            cinema_name = item['cinema_name']
            grouped[movie_name][date][cinema_name].append(item)

        return Response(grouped)

class SeatStatusViewSet(viewsets.ModelViewSet):
    queryset = SeatStatus.objects.all()
    serializer_class = SeatStatusSerializer

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['showtime']
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return []

    @action(detail=False, methods=['get'], url_path='by-showtime/(?P<showtime_id>[^/.]+)')
    def by_showtime(self, request, showtime_id=None):
        queryset = SeatStatus.objects.filter(showtime_id=showtime_id)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


from rest_framework.decorators import api_view
from django.utils.dateparse import parse_date
from django.db.models import Sum, Count
from django.db.models import Q
from payment.models import *

@api_view(['GET'])
def revenue_summary(request):
    start_date_str = request.GET.get('start_date')
    end_date_str = request.GET.get('end_date')
    
    date_filter = Q()
    if start_date_str:
        start_date = parse_date(start_date_str)
        if start_date:
            date_filter &= Q(created_at__date__gte=start_date)
    if end_date_str:
        end_date = parse_date(end_date_str)
        if end_date:
            date_filter &= Q(created_at__date__lte=end_date)

    total_revenue = Payment.objects.filter(
        date_filter,
        status='paid'
    ).aggregate(total=Sum('total_price'))['total'] or 0
    
    total_orders = Payment.objects.filter(
        date_filter,
        status='paid'
    ).count()
    
    return Response({
        'status': 'success',
        'data': {
            'total_revenue': total_revenue,
            'total_orders': total_orders,
            'average_order_value': total_revenue / total_orders if total_orders > 0 else 0
        }
    })




@api_view(['GET'])
def revenue_by_cinema_group(request):
    """API lấy doanh thu theo cụm rạp (lọc theo ngày, bỏ giờ)"""
    start_date = request.GET.get('start_date')
    end_date = request.GET.get('end_date')
    
    date_filter = Q()
    if start_date:
        date_filter &= Q(created_at__date__gte=start_date)
    if end_date:
        date_filter &= Q(created_at__date__lte=end_date)
    
    cinema_groups = CinemaCluster.objects.all()
    result = []
    
    for group in cinema_groups:
        cinemas = group.cinema_set.all()
        
        ticket_revenue = Payment.objects.filter(
            date_filter,
            status='paid',
            tickets__showtime__cinema__in=cinemas
        ).aggregate(total=Sum('total_price'))['total'] or 0
        
        snack_revenue = Payment.objects.filter(
            date_filter,
            status='paid',
            snacks__isnull=False,
            tickets__showtime__cinema__in=cinemas
        ).aggregate(total=Sum('total_price'))['total'] or 0
        
        total_orders = Payment.objects.filter(
            date_filter,
            status='paid',
            tickets__showtime__cinema__in=cinemas
        ).distinct().count()
        
        result.append({
            'group_id': group.id,
            'group_name': group.name,
            'total_revenue': ticket_revenue,
            'total_orders': total_orders,
            'cinema_count': cinemas.count()
        })
    
    return Response({
        'status': 'success',
        'data': result
    })

@api_view(['GET'])
def revenue_by_cinema(request, group_id):
    """API lấy doanh thu theo từng rạp trong cụm (lọc theo ngày, bỏ giờ)"""
    try:
        cinema_group = CinemaCluster.objects.get(id=group_id)
    except CinemaCluster.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'Cinema group not found'
        }, status=404)
    
    start_date = request.GET.get('start_date')
    end_date = request.GET.get('end_date')
    
    date_filter = Q()
    if start_date:
        date_filter &= Q(created_at__date__gte=start_date)
    if end_date:
        date_filter &= Q(created_at__date__lte=end_date)
    
    cinemas = cinema_group.cinema_set.all()
    result = []
    
    for cinema in cinemas:
        ticket_revenue = Payment.objects.filter(
            date_filter,
            status='paid',
            tickets__showtime__cinema=cinema
        ).aggregate(total=Sum('total_price'))['total'] or 0
        
        tickets_sold = Ticket.objects.filter(
            payment__status='paid',
            payment__created_at__date__gte=start_date if start_date else None,
            payment__created_at__date__lte=end_date if end_date else None,
            showtime__cinema=cinema
        ).count()
        
        showtime_filter = Q(cinema=cinema)
        if start_date and end_date:
            showtime_filter &= Q(date__range=[start_date, end_date])
        
        showtimes_count = Showtime.objects.filter(showtime_filter).count()
        
        result.append({
            'cinema_id': cinema.id,
            'cinema_name': cinema.name,
            'cinema_address': cinema.address,
            'total_revenue': ticket_revenue,
            'tickets_sold': tickets_sold,
            'showtimes_count': showtimes_count
        })
    
    return Response({
        'status': 'success',
        'group_name': cinema_group.name,
        'data': result
    })



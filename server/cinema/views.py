from rest_framework import viewsets, filters
from .models import *
from .serializers import *
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.permissions import IsAdminUser

class CinemaClusterViewSet(viewsets.ModelViewSet):
    queryset = CinemaCluster.objects.all()
    serializer_class = CinemaClusterSerializer
    def get_permissions(self):
        if self.action in ['create', 'update', 'destroy']:
            return [IsAdminUser()]
        return []

class CinemaViewSet(viewsets.ModelViewSet):
    queryset = Cinema.objects.all()
    serializer_class = CinemaSerializer
    def get_permissions(self):
        if self.action in ['create', 'update', 'destroy']:
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
        if self.action in ['create', 'update', 'destroy']:
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
        if self.action in ['create', 'update', 'destroy']:
            return [IsAdminUser()]
        return []

    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['movie', 'date', 'cinema']

class SeatStatusViewSet(viewsets.ModelViewSet):
    queryset = SeatStatus.objects.all()
    serializer_class = SeatStatusSerializer
    def get_permissions(self):
        if self.action in ['create', 'update', 'destroy']:
            return [IsAdminUser()]
        return []

    @action(detail=False, methods=['get'], url_path='by-showtime/(?P<showtime_id>[^/.]+)')
    def by_showtime(self, request, showtime_id=None):
        queryset = SeatStatus.objects.filter(showtime_id=showtime_id)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

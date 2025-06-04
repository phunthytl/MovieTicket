from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import *
from .serializers import *
from cinema.models import *
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.decorators import action
from django.utils import timezone
from rest_framework.response import Response
from payment.models import *

class MovieViewSet(viewsets.ModelViewSet):
    queryset = Movie.objects.all().order_by('-created_at')
    serializer_class = MovieSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return []
    
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'genres'] 
    search_fields = ['name']
    ordering_fields = ['created_at']

    @action(detail=False, methods=['get'], url_path='hot-slider')
    def hot_slider(self, request):
        now = timezone.now()

        # Lấy 5 suất chiếu gần nhất trong tương lai
        showtimes = Showtime.objects.filter(
            date__gte=now.date()
        ).order_by('date', 'start_time')[:10]

        # Lấy unique movie từ các suất chiếu này
        movie_ids = []
        hot_movies = []
        for show in showtimes:
            if show.movie.id not in movie_ids:
                hot_movies.append(show.movie)
                movie_ids.append(show.movie.id)
            if len(hot_movies) >= 5:
                break

        serializer = self.get_serializer(hot_movies, many=True)
        return Response(serializer.data)

class GenreViewSet(viewsets.ModelViewSet):
    queryset = Genre.objects.all().order_by('name')
    serializer_class = GenreSerializer
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return []

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all().order_by('-created_at')

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['movie', 'user'] 

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated()]
        return []
    
    def get_serializer_class(self):
        if self.action == 'list' or self.action == 'retrieve':
            return ReviewSerializer
        return ReviewCreateSerializer

    def perform_create(self, serializer):
        user = self.request.user
        movie = serializer.validated_data.get('movie')

        # Lấy các ticket user đã mua (payment đã thanh toán)
        paid_tickets = Ticket.objects.filter(
            payment__user=user,
            payment__status='paid',
            showtime__movie=movie,
        )

        if not paid_tickets.exists():
            raise serializers.ValidationError("Bạn cần phải mua vé phim này mới có thể đánh giá.")
        
        existing_review = Review.objects.filter(user=user, movie=movie).first()
        if existing_review:
            raise serializers.ValidationError("Bạn đã đánh giá phim này rồi.")

        serializer.save(user=user)
from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import *
from .serializers import *
from cinema.models import *
from rest_framework.permissions import IsAdminUser
from rest_framework.decorators import action
from django.utils import timezone
from rest_framework.response import Response

class MovieViewSet(viewsets.ModelViewSet):
    queryset = Movie.objects.all().order_by('-created_at')
    serializer_class = MovieSerializer
    def get_permissions(self):
        if self.action in ['create', 'update', 'destroy']:
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
        if self.action in ['create', 'update', 'destroy']:
            return [IsAdminUser()]
        return []

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all().order_by('-created_at')
    serializer_class = ReviewSerializer
    def get_permissions(self):
        if self.action in ['create', 'update', 'destroy']:
            return [IsAdminUser()]
        return []

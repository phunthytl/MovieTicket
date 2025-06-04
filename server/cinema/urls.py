from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *
from . import views

router = DefaultRouter()
router.register(r'clusters', CinemaClusterViewSet)
router.register(r'cinemas', CinemaViewSet)
router.register(r'rooms', RoomViewSet)
router.register(r'seats', SeatViewSet)
router.register(r'showtimes', ShowtimeViewSet)
router.register(r'seat-status', SeatStatusViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('revenue/cinema-groups/', revenue_by_cinema_group, name='revenue_by_cinema_group'),
    path('revenue/cinema-groups/<str:group_id>/cinemas/', revenue_by_cinema, name='revenue_by_cinema'),
    path('revenue/summary/', revenue_summary, name='revenue_summary'),
]

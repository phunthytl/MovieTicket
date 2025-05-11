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
]

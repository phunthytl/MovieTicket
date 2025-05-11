from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register(r'snacks', SnackViewSet)
router.register(r'payments', PaymentViewSet)
router.register(r'payment-seats', PaymentSeatViewSet)
router.register(r'payment-snacks', PaymentSnackViewSet)

urlpatterns = [
    path('', include(router.urls)),
]

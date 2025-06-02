from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register(r'snacks', SnackViewSet, basename='snack')
router.register(r'payment-snacks', PaymentSnackViewSet, basename='payment-snack')
router.register(r'payment-seats', PaymentSeatViewSet)
router.register(r'payments', PaymentViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('create-vnpay/', create_vnpay_payment, name='payment-create'),
    path('vnpay-return/', vnpay_return, name='vnpay_return'),
]

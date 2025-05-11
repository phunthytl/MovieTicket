from django.db import models
from cinema.models import *
from user.models import *

class Snack(models.Model):
    id = models.CharField(primary_key=True, max_length=20)
    name = models.CharField(max_length=100, null=True, blank=True)
    price = models.PositiveIntegerField(null=True, blank=True)
    image = models.ImageField(upload_to='snacks/', null=True, blank=True)
    description = models.TextField(null=True, blank=True)

    def __str__(self):
        return self.name or self.id


class Payment(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    total_price = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=50, default='pending')
    momo_order_id = models.CharField(max_length=100, null=True, blank=True)
    momo_trans_id = models.CharField(max_length=100, null=True, blank=True)
    momo_signature = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Payment #{self.id} - {self.status}"


class PaymentSeat(models.Model):
    payment = models.ForeignKey(Payment, on_delete=models.CASCADE, related_name='tickets')
    seat = models.ForeignKey(Seat, on_delete=models.SET_NULL, null=True)
    showtime = models.ForeignKey(Showtime, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return f"{self.seat.id} | {self.showtime.id}"


class PaymentSnack(models.Model):
    payment = models.ForeignKey(Payment, on_delete=models.CASCADE, related_name='snacks')
    snack = models.ForeignKey(Snack, on_delete=models.SET_NULL, null=True)
    quantity = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.snack.name} x {self.quantity}"

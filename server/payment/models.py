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


class Voucher(models.Model):
    code = models.CharField(max_length=50, unique=True)
    discount_amount = models.PositiveIntegerField()
    discount_type = models.CharField(
        max_length=20,
        choices=[('amount', 'Số tiền cố định'), ('percentage', 'Phần trăm')]
    )
    min_spent = models.PositiveIntegerField(default=0)
    max_discount = models.PositiveIntegerField(default=0, null=True, blank=True)
    quantity = models.PositiveIntegerField(default=100)
    active = models.BooleanField(default=True)
    start_date = models.DateTimeField(null=True, blank=True)
    end_date = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.code} (-{self.discount_amount} {self.discount_type})"


class Payment(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    total_price = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=50, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Voucher và chiết khấu lưu vết
    voucher = models.ForeignKey(Voucher, on_delete=models.SET_NULL, null=True, blank=True)
    vip_discount = models.PositiveIntegerField(default=0)
    voucher_discount = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"Payment #{self.id} - {self.status}"


class Ticket(models.Model):
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


class UserVoucher(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_vouchers')
    voucher = models.ForeignKey(Voucher, on_delete=models.CASCADE, related_name='user_vouchers')
    used_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'voucher')

    def __str__(self):
        return f"{self.user.username} used {self.voucher.code}"

from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    phone = models.CharField(max_length=15, blank=True, null=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    vip_level = models.IntegerField(default=0)

    def update_vip_level(self):
        from payment.models import Payment
        from django.utils import timezone
        from datetime import timedelta
        from django.db.models import Sum

        one_year_ago = timezone.now() - timedelta(days=365)
        total_spent = Payment.objects.filter(
            user=self,
            status='paid',
            created_at__gte=one_year_ago
        ).aggregate(total=Sum('total_price'))['total'] or 0

        new_vip_level = 0
        if total_spent >= 10000000:
            new_vip_level = 3  # Diamond
        elif total_spent >= 5000000:
            new_vip_level = 2  # Gold
        elif total_spent >= 1000000:
            new_vip_level = 1  # Silver

        if self.vip_level != new_vip_level:
            self.vip_level = new_vip_level
            self.save(update_fields=['vip_level'])

        return self.vip_level

    def get_total_spent(self):
        from payment.models import Payment
        from django.utils import timezone
        from datetime import timedelta
        from django.db.models import Sum

        one_year_ago = timezone.now() - timedelta(days=365)
        return Payment.objects.filter(
            user=self,
            status='paid',
            created_at__gte=one_year_ago
        ).aggregate(total=Sum('total_price'))['total'] or 0

    def __str__(self):
        return self.username
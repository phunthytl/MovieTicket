from django.db import models
from movie.models import *

class CinemaCluster(models.Model):
    id = models.CharField(primary_key=True, max_length=20)
    name = models.CharField(max_length=100, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    image = models.ImageField(upload_to='images/', null=True, blank=True)

    def __str__(self):
        return self.name


class Cinema(models.Model):
    id = models.CharField(primary_key=True, max_length=20)
    name = models.CharField(max_length=100, null=True, blank=True)
    address = models.CharField(max_length=255, null=True, blank=True)
    contact = models.CharField(max_length=20, null=True, blank=True)
    city = models.CharField(max_length=255, null=True, blank=True)
    cluster = models.ForeignKey(CinemaCluster, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return self.name


class Room(models.Model):
    id = models.CharField(primary_key=True, max_length=20)
    name = models.CharField(max_length=100, null=True, blank=True)
    type = models.CharField(max_length=100, null=True, blank=True)
    cinema = models.ForeignKey(Cinema, on_delete=models.CASCADE)
    status = models.CharField(max_length=50, null=True, blank=True)

    def __str__(self):
        return f"{self.name} - {self.cinema.name}"


class Seat(models.Model):
    id = models.CharField(primary_key=True, max_length=20)
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    row = models.CharField(max_length=10, null=True, blank=True)
    column = models.IntegerField(default=0)
    price = models.PositiveIntegerField(default=70000)

    def save(self, *args, **kwargs):
        try:
            predefined_rows = [chr(i) for i in range(ord('A'), ord('K'))]  # A-J
            row_upper = self.row.upper() if self.row else ''
            
            if row_upper in ['A', 'B']:
                self.price = 50000
            elif row_upper in predefined_rows[-2:]:  # I, J
                self.price = 90000
            else:
                self.price = 70000
        except Exception as e:
            print(f"Lỗi khi tính giá ghế: {e}")
            self.price = 70000

        super().save(*args, **kwargs)

    def __str__(self):
        return f"Seat {self.room.name}"

class Showtime(models.Model):
    id = models.CharField(primary_key=True, max_length=20)
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    cinema = models.ForeignKey(Cinema, on_delete=models.CASCADE)
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE)
    date = models.DateField()
    start_time = models.TimeField()

    def __str__(self):
        return f"{self.movie.name} @ {self.room.name} - {self.date}"


class SeatStatus(models.Model):
    seat = models.ForeignKey(Seat, on_delete=models.CASCADE)
    showtime = models.ForeignKey(Showtime, on_delete=models.CASCADE)
    status = models.CharField(max_length=20) 
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.seat} - {self.showtime} [{self.status}]"

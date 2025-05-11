from django.db import models
from user.models import *

# Create your models here.

class Genre(models.Model):
    id = models.CharField(primary_key=True, max_length=20)
    name = models.CharField(max_length=100, null=True, blank=True)
    def __str__(self):
        return self.id

class Movie(models.Model):
    id = models.CharField(primary_key=True, max_length=20)
    name = models.CharField(max_length=200, null=True, blank=True)
    duration = models.PositiveIntegerField(null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    country = models.CharField(max_length=100, null=True, blank=True)
    language = models.CharField(max_length=50, null=True, blank=True)
    age_rating = models.CharField(max_length=10, null=True, blank=True)
    poster = models.ImageField(upload_to='posters/', null=True, blank=True)
    trailer = models.URLField(null=True, blank=True)
    status = models.CharField(max_length=50, null=True, blank=True)
    genres = models.ManyToManyField(Genre, related_name='movies', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
        
class Review(models.Model):
    user = models.ForeignKey('user.User', on_delete=models.CASCADE, null=True, blank=True)
    movie = models.ForeignKey('Movie', on_delete=models.CASCADE, null=True, blank=True)
    rate = models.IntegerField(null=True, blank=True)
    comment = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True) 

    def __str__(self):
        return f"{self.user} - {self.movie} ({self.rate})"

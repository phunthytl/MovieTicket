from rest_framework import serializers
from .models import *
class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = '__all__'

class MovieSerializer(serializers.ModelSerializer):
    genres = GenreSerializer(many=True, read_only=True)
    genre_ids = serializers.PrimaryKeyRelatedField(
        queryset = Genre.objects.all(), write_only=True, many=True, source='genres'
    )

    class Meta:
        model = Movie
        fields = '__all__'

class ReviewSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    movie = serializers.SerializerMethodField()
    class Meta:
        model = Review
        fields = '__all__'

    def get_user(self, obj):
        user = obj.user
        if user:
            avatar_url = None
            if user.avatar and hasattr(user.avatar, 'url'):
                avatar_url = user.avatar.url
            return {
                "id": user.id,
                "username": user.username,
                "avatar": avatar_url
            }
        return None
    
    def get_movie(self, obj):
        if obj.movie:
            return {
                "id": obj.movie.id,
                "name": obj.movie.name
            }
        return None
    
class ReviewCreateSerializer(serializers.ModelSerializer):
    movie = serializers.PrimaryKeyRelatedField(queryset=Movie.objects.all())

    class Meta:
        model = Review
        fields = ['movie', 'rate', 'comment']
    

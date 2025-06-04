from rest_framework import serializers
from movie.serializers import MovieSerializer
from .models import *
from datetime import datetime, timedelta

class CinemaClusterSerializer(serializers.ModelSerializer):
    class Meta:
        model = CinemaCluster
        fields = '__all__'

class CinemaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cinema
        fields = '__all__'

class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = '__all__'

class SeatSerializer(serializers.ModelSerializer):
    matrix_position = serializers.SerializerMethodField()

    class Meta:
        model = Seat
        fields = "__all__"

    def get_matrix_position(self, obj):
        return f"{obj.row}{obj.column}"

class ShowtimeSerializer(serializers.ModelSerializer):
    movie_name = serializers.CharField(source='movie.name', read_only=True)
    movie_poster = serializers.ImageField(source='movie.poster', read_only=True)
    cinema_image = serializers.ImageField(source='cinema.cluster.image', read_only=True)
    cinema_name = serializers.CharField(source='cinema.name', read_only=True)
    cinema_address = serializers.CharField(source='cinema.address', read_only=True)
    room_name = serializers.CharField(source='room.name', read_only=True)
    start_time = serializers.TimeField(format="%H:%M")
    end_time = serializers.SerializerMethodField()

    class Meta:
        model = Showtime
        fields = '__all__'

    def get_end_time(self, obj):
        start_time = datetime.combine(obj.date, obj.start_time)
        end_time = start_time + timedelta(minutes=obj.movie.duration)
        return end_time.strftime('%H:%M')
    
    def validate(self, data):
        room = data.get('room')
        date = data.get('date')
        start_time = data.get('start_time')
        movie = data.get('movie')
        current_id = self.instance.id if self.instance else None

        start_dt = datetime.combine(date, start_time)
        movie_duration = movie.duration
        end_dt = start_dt + timedelta(minutes=movie_duration)

        # Tìm tất cả suất chiếu khác cùng phòng, cùng ngày
        overlaps = Showtime.objects.filter(room=room, date=date).exclude(id=current_id)

        for s in overlaps:
            s_start = datetime.combine(s.date, s.start_time)
            s_end = s_start + timedelta(minutes=s.movie.duration)
            if start_dt < s_end and end_dt > s_start:
                if start_dt < s_start:
                    # phim mới kết thúc trễ → đè lên phim cũ
                    raise serializers.ValidationError(
                        f"❌ Phim bạn chọn kết thúc lúc {end_dt.strftime('%H:%M')} đè lên phim '{s.movie.name}' bắt đầu lúc {s_start.strftime('%H:%M')}"
                    )
                else:
                    # phim mới bắt đầu sớm → trùng suất đã có
                    raise serializers.ValidationError(
                        f"❌ Trùng với suất chiếu phim '{s.movie.name}' từ {s_start.strftime('%H:%M')} đến {s_end.strftime('%H:%M')}"
                    )
        return data


class SeatStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = SeatStatus
        fields = '__all__'

class CinemaGroupRevenueSerializer(serializers.Serializer):
    group_id = serializers.CharField()
    group_name = serializers.CharField()
    total_revenue = serializers.DecimalField(max_digits=10, decimal_places=2)
    total_orders = serializers.IntegerField()
    cinema_count = serializers.IntegerField()

class CinemaRevenueSerializer(serializers.Serializer):
    cinema_id = serializers.CharField()
    cinema_name = serializers.CharField()
    cinema_address = serializers.CharField()
    total_revenue = serializers.DecimalField(max_digits=10, decimal_places=2)
    tickets_sold = serializers.IntegerField()
    showtimes_count = serializers.IntegerField()
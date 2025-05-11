from datetime import datetime, timedelta, date
from rest_framework import serializers
from .models import *
from cinema.models import *

class SnackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Snack
        fields = '__all__'


class PaymentSeatSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentSeat
        fields = '__all__'


class PaymentSnackSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentSnack
        fields = '__all__'


class PaymentSerializer(serializers.ModelSerializer):
    tickets = PaymentSeatSerializer(many=True, read_only=True)
    snacks = PaymentSnackSerializer(many=True, read_only=True)

    class Meta:
        model = Payment
        fields = '__all__'


class PaymentDetailSerializer(serializers.ModelSerializer):
    seats = serializers.SerializerMethodField()
    ticket_total = serializers.SerializerMethodField()
    snack_total = serializers.SerializerMethodField()
    movie_name = serializers.SerializerMethodField()
    cinema_name = serializers.SerializerMethodField()
    cinema_address = serializers.SerializerMethodField()
    start_time = serializers.SerializerMethodField()
    end_time = serializers.SerializerMethodField()
    date = serializers.SerializerMethodField()
    room_name = serializers.SerializerMethodField()

    class Meta:
        model = Payment
        fields = '__all__'

    def get_seats(self, obj):
        return [ticket.seat.matrix_position for ticket in obj.tickets.all() if ticket.seat]

    def get_ticket_total(self, obj):
        return sum(ticket.seat.price for ticket in obj.tickets.all() if ticket.seat and ticket.seat.price)

    def get_snack_total(self, obj):
        return sum(snack.quantity * (snack.snack.price or 0) for snack in obj.snacks.all() if snack.snack)

    def get_movie_name(self, obj):
        ticket = obj.tickets.first()
        if ticket and ticket.showtime and ticket.showtime.movie:
            return ticket.showtime.movie.name
        return None

    def get_cinema_name(self, obj):
        ticket = obj.tickets.first()
        if ticket and ticket.showtime and ticket.showtime.cinema:
            return ticket.showtime.cinema.name
        return None

    def get_cinema_address(self, obj):
        ticket = obj.tickets.first()
        if ticket and ticket.showtime and ticket.showtime.cinema:
            return ticket.showtime.cinema.address
        return None

    def get_start_time(self, obj):
        ticket = obj.tickets.first()
        if ticket and ticket.showtime:
            return ticket.showtime.start_time.strftime("%H:%M")
        return None

    def get_end_time(self, obj):
        ticket = obj.tickets.first()
        if ticket and ticket.showtime and ticket.showtime.movie:
            try:
                start_dt = datetime.combine(date.today(), ticket.showtime.start_time)
                end_dt = start_dt + timedelta(minutes=ticket.showtime.movie.duration)
                return end_dt.time().strftime("%H:%M")
            except Exception:
                return None
        return None

    def get_date(self, obj):
        ticket = obj.tickets.first()
        if ticket and ticket.showtime:
            return ticket.showtime.date.strftime("%Y-%m-%d")
        return None

    def get_room_name(self, obj):
        ticket = obj.tickets.first()
        if ticket and ticket.showtime and ticket.showtime.room:
            return ticket.showtime.room.name
        return None
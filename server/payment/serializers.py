from datetime import datetime, timedelta, date
from rest_framework import serializers
from .models import *
from user.serializers import UserSerializer
from cinema.models import *
from collections import defaultdict

class SnackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Snack
        fields = '__all__'


class PaymentTicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = '__all__'


class PaymentSnackSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentSnack
        fields = '__all__'


class PaymentSerializer(serializers.ModelSerializer):
    snacks = PaymentSnackSerializer(many=True, read_only=True)
    user = UserSerializer(read_only=True)
    tickets = serializers.SerializerMethodField()
    showtime_end = serializers.SerializerMethodField(read_only = True)
    movie_id = serializers.SerializerMethodField(read_only = True)
    movie_name = serializers.SerializerMethodField(read_only = True)

    class Meta:
        model = Payment
        fields = '__all__'

    def get_tickets(self, obj):
        grouped = defaultdict(list)
        for ticket in obj.tickets.all():
            key = str(ticket.showtime.id)
            seat_id = str(ticket.seat.id)
            grouped[key].append(seat_id)
        return dict(grouped)
    
    def get_showtime_end(self, obj):
        showtimes = [ticket.showtime for ticket in obj.tickets.all() if ticket.showtime]

        if not showtimes:
            return None
        
        showtime = max(showtimes, key=lambda s: datetime.combine(s.date, s.start_time))

        if showtime and showtime.date and showtime.start_time and showtime.movie and showtime.movie.duration:
            start_datetime = datetime.combine(showtime.date, showtime.start_time)
            end_datetime = start_datetime + timedelta(minutes=showtime.movie.duration)
            return end_datetime.isoformat()
        
        return None
    
    def get_movie_id(self, obj):
        ticket = obj.tickets.first()
        if ticket and ticket.showtime and ticket.showtime.movie:
            return ticket.showtime.movie.id
        return None
    
    def get_movie_name(self, obj):
        ticket = obj.tickets.first()
        if ticket and ticket.showtime and ticket.showtime.movie:
            return ticket.showtime.movie.name
        return None


class PaymentDetailSerializer(serializers.ModelSerializer):
    seats = serializers.SerializerMethodField()
    snacks = serializers.SerializerMethodField()
    ticket_total = serializers.SerializerMethodField()
    snack_total = serializers.SerializerMethodField()
    movie_name = serializers.SerializerMethodField()
    cinema_name = serializers.SerializerMethodField()
    cinema_address = serializers.SerializerMethodField()
    start_time = serializers.SerializerMethodField()
    end_time = serializers.SerializerMethodField()
    date = serializers.SerializerMethodField()
    room_name = serializers.SerializerMethodField()
    movie_id = serializers.CharField(source='movie.id', read_only=True)
    showtime_id = serializers.CharField(source='showtime.id', read_only=True)

    class Meta:
        model = Payment
        fields = '__all__'

    def get_seats(self, obj):
        tickets = obj.tickets.all()
        return [f"{ticket.seat.row}{ticket.seat.column}" for ticket in tickets]
    
    def get_snacks(self, obj):
        snacks = obj.snacks.all()
        return [
            f"{snack.snack.name if snack.snack else 'Unknown'} x {snack.quantity}"
            for snack in snacks
        ]

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
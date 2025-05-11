from django.contrib.auth.models import User
from .serializers import *

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

from rest_framework import viewsets
from rest_framework.permissions import IsAdminUser


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)

        serializer = UserSerializerWithToken(self.user).data
        for k, v in serializer.items():
            data[k] = v

        return data

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer
    
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]

    def perform_create(self, serializer):
        data = self.request.data
        full_name = data.get('name', '').strip()
        name_parts = full_name.split()
        first_name = name_parts[-1]
        last_name = " ".join(name_parts[:-1]) if len(name_parts) > 1 else ""

        serializer.save(
            first_name=first_name,
            last_name=last_name,
            is_staff=data.get('isAdmin', False)
        )
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User


class UserSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField(read_only=True)
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'name', 'phone', 'avatar', 'is_staff', 'is_active']

    def get_name(self, obj):
        name = f"{obj.last_name} {obj.first_name}".strip()
        if name == '':
            name = obj.email
        return name


class UserSerializerWithToken(UserSerializer):
    token = serializers.SerializerMethodField(read_only=True)
    name = serializers.SerializerMethodField(read_only=True)
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'name', 'phone', 'avatar', 'is_staff', 'is_active', 'token']

    def get_token(self, obj):
        token = RefreshToken.for_user(obj)
        return str(token.access_token)

    def get_name(self, obj):
        name = f"{obj.last_name} {obj.first_name}".strip()
        if name == '':
            name = obj.email
        return name
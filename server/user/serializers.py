from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User
from django.contrib.auth import update_session_auth_hash

class UserSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField(read_only=True)
    total_spent = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'name', 'phone', 'avatar', 'is_staff', 'is_active', 'vip_level', 'total_spent']

    def get_name(self, obj):
        name = f"{obj.last_name} {obj.first_name}".strip()
        if name == '':
            name = obj.email
        return name

    def get_total_spent(self, obj):
        return obj.get_total_spent()

    def to_representation(self, instance):
        # Tự động cập nhật cấp độ VIP trước khi trả về
        instance.update_vip_level()
        return super().to_representation(instance)


class UserSerializerWithToken(UserSerializer):
    token = serializers.SerializerMethodField(read_only=True)
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'name', 'is_staff', 'is_active', 'token', 'vip_level']

    def get_token(self, obj):
        token = RefreshToken.for_user(obj)
        return str(token.access_token)
    
class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)

    def validate(self, data):
        user = self.context['request'].user
        if not user.check_password(data['old_password']):
            raise serializers.ValidationError("Mật khẩu hiện tại không đúng.")
        return data

    def save(self, **kwargs):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        update_session_auth_hash(self.context['request'], user)

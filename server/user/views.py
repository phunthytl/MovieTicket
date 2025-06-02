from django.contrib.auth.models import User
from .serializers import *
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import viewsets
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.response import Response


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

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated()]
        return [IsAdminUser()]

    def perform_create(self, serializer):
        data = self.request.data
        full_name = data.get('name', '').strip()
        name_parts = full_name.split()
        first_name = name_parts[-1]
        last_name = " ".join(name_parts[:-1]) if len(name_parts) > 1 else ""

        serializer.save(
            first_name=first_name,
            last_name=last_name,
        )
    
    def perform_update(self, serializer):
        data = self.request.data
        full_name = data.get('name', '').strip()
        if full_name:
            name_parts = full_name.split()
            first_name = name_parts[-1] if name_parts else ''
            last_name = " ".join(name_parts[:-1]) if len(name_parts) > 1 else ""
            serializer.save(
                first_name=first_name,
                last_name=last_name,
            )
        else:
            serializer.save()

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def changePassword(self, request):
        user = request.user
        data = request.data

        old_password = data.get('old_password')
        new_password = data.get('new_password')

        if not old_password or not new_password:
            return Response({"detail": "Thiếu thông tin mật khẩu"}, status=status.HTTP_400_BAD_REQUEST)

        if not user.check_password(old_password):
            return Response({"detail": "Mật khẩu hiện tại không đúng"}, status=status.HTTP_400_BAD_REQUEST)

        if len(new_password) < 6:
            return Response({"detail": "Mật khẩu mới phải có ít nhất 6 ký tự"}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()

        return Response({"detail": "Đổi mật khẩu thành công"}, status=status.HTTP_200_OK)
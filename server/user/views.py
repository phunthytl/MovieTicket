from django.contrib.auth.models import User
from .serializers import *
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import viewsets
from rest_framework.permissions import IsAdminUser, IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.contrib.auth.hashers import make_password
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
        if self.action == 'create':
            return [AllowAny()]  # Bất kỳ ai cũng có thể tạo tài khoản
        elif self.action in ['list', 'destroy']:
            return [IsAdminUser()]  # Chỉ admin được xóa
        else:
            return [IsAuthenticated()]  # Các hành động còn lại yêu cầu đăng nhập
    
    def get_serializer_class(self):
        if self.action == 'create':
            return UserSerializerWithToken
        return UserSerializer

    def perform_create(self, serializer):
        data = self.request.data
        full_name = data.get('name', '').strip()
        name_parts = full_name.split()
        first_name = name_parts[-1]
        last_name = " ".join(name_parts[:-1]) if len(name_parts) > 1 else ""

        password = make_password(data['password']) if 'password' in data else None

        serializer.save(
            first_name=first_name,
            last_name=last_name,
            password=password
        )

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def changePassword(self, request):
        user = request.user
        data = request.data

        if data.get('old_password') and data.get('new_password'):
            serializer = ChangePasswordSerializer(data=data, context={'request': request})
            if serializer.is_valid():
                serializer.save()
                return Response({"message": "Đổi mật khẩu thành công!"}, status=status.HTTP_200_OK)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)
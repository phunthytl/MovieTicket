from rest_framework.permissions import BasePermission

class IsOwnerOrAdmin(BasePermission):
    """
    Phân quyền chỉ cho phép người sở hữu (Owner) hoặc Quản trị viên (Admin) truy cập/sửa đổi đối tượng.
    """
    def has_permission(self, request, view):
        # Yêu cầu người dùng phải được xác thực
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # Admin có toàn quyền truy cập
        if request.user and request.user.is_staff:
            return True

        # Trường hợp đối tượng là chính User (UserProfile)
        from django.contrib.auth import get_user_model
        User = get_user_model()
        if isinstance(obj, User):
            return obj == request.user

        # Trường hợp đối tượng trực tiếp liên kết với user (Ví dụ: Payment)
        if hasattr(obj, 'user') and obj.user is not None:
            return obj.user == request.user

        # Trường hợp đối tượng liên kết gián tiếp qua payment (Ví dụ: Ticket, PaymentSnack)
        if hasattr(obj, 'payment') and obj.payment is not None:
            return obj.payment.user == request.user

        return False

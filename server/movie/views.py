from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from movie.models import *
from movie.serializers import *
from cinema.models import *
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.decorators import action
from django.utils import timezone
from rest_framework.response import Response
from payment.models import *

class MovieViewSet(viewsets.ModelViewSet):
    queryset = Movie.objects.all().order_by('-created_at')
    serializer_class = MovieSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return []
    
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'genres'] 
    search_fields = ['name']
    ordering_fields = ['created_at']

    @action(detail=False, methods=['get'], url_path='hot-slider')
    def hot_slider(self, request):
        now = timezone.now()

        # Lấy 5 suất chiếu gần nhất trong tương lai
        showtimes = Showtime.objects.filter(
            date__gte=now.date()
        ).order_by('date', 'start_time')[:10]

        # Lấy unique movie từ các suất chiếu này
        movie_ids = []
        hot_movies = []
        for show in showtimes:
            if show.movie.id not in movie_ids:
                hot_movies.append(show.movie)
                movie_ids.append(show.movie.id)
            if len(hot_movies) >= 5:
                break

        serializer = self.get_serializer(hot_movies, many=True)
        return Response(serializer.data)

class GenreViewSet(viewsets.ModelViewSet):
    queryset = Genre.objects.all().order_by('name')
    serializer_class = GenreSerializer
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return []

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all().order_by('-created_at')

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['movie', 'user'] 

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated()]
        return []
    
    def get_serializer_class(self):
        if self.action == 'list' or self.action == 'retrieve':
            return ReviewSerializer
        return ReviewCreateSerializer

    def perform_create(self, serializer):
        user = self.request.user
        movie = serializer.validated_data.get('movie')

        # Lấy các ticket user đã mua (payment đã thanh toán)
        paid_tickets = Ticket.objects.filter(
            payment__user=user,
            payment__status='paid',
            showtime__movie=movie,
        )

        if not paid_tickets.exists():
            raise serializers.ValidationError("Bạn cần phải mua vé phim này mới có thể đánh giá.")
        
        existing_review = Review.objects.filter(user=user, movie=movie).first()
        if existing_review:
            raise serializers.ValidationError("Bạn đã đánh giá phim này rồi.")

        serializer.save(user=user)

import json
import os
import google.generativeai as genai
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from django.conf import settings

class AIChatView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        message = request.data.get('message', '').strip()
        history = request.data.get('history', [])

        if not message:
            return Response({'error': 'Message is required'}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Thu thập danh sách phim thực tế đang chiếu làm Context
        active_movies = Movie.objects.filter(status__in=['Đang chiếu', 'Sắp chiếu'])
        movies_context = []
        for m in active_movies:
            genres = ", ".join([g.name for g in m.genres.all()])
            movies_context.append(
                f"ID: {m.id}\n"
                f"Tên: {m.name}\n"
                f"Thể loại: {genres}\n"
                f"Thời lượng: {m.duration} phút\n"
                f"Mô tả: {m.description}\n"
                f"Trạng thái: {m.status}\n"
                f"-------------------"
            )
        context_str = "\n".join(movies_context)

        # 2. Xây dựng System Prompt
        system_prompt = (
            "Bạn là trợ lý AI thông minh tư vấn đặt vé xem phim của rạp SuperStar.\n"
            "Dưới đây là danh sách các bộ phim đang và sắp chiếu tại rạp:\n\n"
            f"{context_str}\n\n"
            "Nhiệm vụ của bạn:\n"
            "1. Tư vấn, trả lời câu hỏi và tìm kiếm phim theo mô tả cốt truyện, thể loại, sở thích của khách hàng một cách thân thiện bằng tiếng Việt.\n"
            "2. Nếu tìm thấy phim phù hợp trong danh sách trên, hãy giới thiệu phim đó và liệt kê phim vào danh sách `suggested_movies` (chỉ đưa những phim có thực tế trong danh sách ngữ cảnh trên, không tự bịa ID).\n"
            "3. KHÔNG bao giờ hiển thị mã ID của phim (ví dụ: 'M10', 'M05', v.v.) trong nội dung câu trả lời `reply` của bạn. Hãy nói chuyện tự nhiên bằng tên phim. Mã ID chỉ được phép trả về trong cấu trúc JSON `suggested_movies`.\n"
            "4. Nếu không tìm thấy phim nào phù hợp trong danh sách rạp đang chiếu, hãy trả lời lịch sự là rạp hiện chưa chiếu phim phù hợp và gợi ý các phim hot khác đang chiếu. Không thêm phim ngoài danh sách rạp vào `suggested_movies`.\n"
            "5. Hỗ trợ định dạng Markdown cho câu trả lời (như bôi đậm, xuống dòng, bullet points để câu trả lời dễ đọc)."
        )

        # 3. Tạo hội thoại đầy đủ
        conversation_history = ""
        for chat in history:
            role = "Khách hàng" if chat.get('role') == 'user' else "Trợ lý AI"
            conversation_history += f"{role}: {chat.get('message')}\n"

        prompt = (
            f"{system_prompt}\n\n"
            f"Lịch sử hội thoại trước đó:\n{conversation_history}\n"
            f"Khách hàng: {message}\n"
            "Trợ lý AI (hãy phản hồi dưới định dạng JSON theo response_schema):"
        )

        # 4. Gọi Gemini API
        try:
            api_key = os.getenv('GEMINI_API_KEY')
            if not api_key:
                return Response({
                    'reply': "Chào bạn! Tôi là trợ lý AI của rạp SuperStar. Hiện tại máy chủ chưa cấu hình API Key cho Gemini AI, vui lòng quay lại sau nhé!",
                    'suggested_movies': []
                })

            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-2.5-flash')
            
            # Khai báo schema định dạng trả về mong muốn bằng Pydantic
            from pydantic import BaseModel, Field
            from typing import List

            class MovieSuggestion(BaseModel):
                id: str = Field(description="Mã ID của phim (ví dụ: M01)")
                name: str = Field(description="Tên của phim")

            class AIChatResponse(BaseModel):
                reply: str = Field(description="Lời thoại phản hồi của AI tư vấn cho khách hàng bằng tiếng Việt, hỗ trợ Markdown.")
                suggested_movies: List[MovieSuggestion] = Field(description="Danh sách các bộ phim được đề xuất cho khách hàng liên quan đến câu hỏi.")

            response = model.generate_content(
                prompt,
                generation_config={
                    "response_mime_type": "application/json",
                    "response_schema": AIChatResponse
                }
            )

            # Phân tích kết quả JSON
            result_data = json.loads(response.text)
            
            # Bổ sung thông tin poster của phim được gợi ý để frontend render được card
            suggested_movies = []
            for item in result_data.get('suggested_movies', []):
                movie_id = item.get('id')
                try:
                    movie_obj = Movie.objects.get(id=movie_id)
                    poster_url = request.build_absolute_uri(movie_obj.poster.url) if movie_obj.poster else None
                    suggested_movies.append({
                        'id': movie_obj.id,
                        'name': movie_obj.name,
                        'poster': poster_url,
                        'duration': movie_obj.duration
                    })
                except Movie.DoesNotExist:
                    pass

            return Response({
                'reply': result_data.get('reply', ''),
                'suggested_movies': suggested_movies
            })

        except Exception as e:
            print(f"Error calling Gemini API: {e}")
            return Response({
                'reply': "Xin lỗi bạn, hệ thống AI đang bận xử lý, bạn vui lòng thử lại sau giây lát nhé!",
                'suggested_movies': []
            })

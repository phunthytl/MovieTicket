# BỔ SUNG ĐẶC TẢ USECASE CHI TIẾT (BÁO CÁO THỰC TẬP CƠ SỞ)

Dưới đây là phần đặc tả chi tiết của 2 usecase mới được phát triển. Định dạng và ngôn ngữ được thiết kế chuẩn xác theo mẫu báo cáo trong tài liệu hướng dẫn.

---

### 3.1.2. Usecase chi tiết (Bổ sung)
*   **Usecase 21: Tư vấn phim qua AI Chatbot**
*   **Usecase 22: Xem hạng thành viên**

---

### 3.2. Xây dựng kịch bản cho các usecase (Bổ sung)

#### 21. Tư vấn phim qua AI Chatbot
**Usecase**  
Tư vấn phim qua AI Chatbot

**Actor**  
Customer (Khách hàng)

**Tiền điều kiện**  
Người dùng truy cập vào trang web hệ thống.

**Hậu điều kiện**  
Người dùng nhận được phản hồi tư vấn và danh sách phim gợi ý phù hợp từ AI.

**Kịch bản chính**  
1. Người dùng nhấn vào biểu tượng bong bóng chat AI ở góc dưới bên phải màn hình.
2. Giao diện khung Chatbot hiện lên với lời chào mừng từ trợ lý ảo SuperStar.
3. Người dùng nhập câu hỏi hoặc mô tả yêu cầu tìm phim (ví dụ: *"tôi muốn xem phim kinh dị hoặc phim có siêu anh hùng"*) vào ô nhập liệu và nhấn nút gửi hoặc phím Enter.
4. Hệ thống tiếp nhận câu hỏi, tự động tổng hợp ngữ cảnh danh sách phim đang chiếu và sắp chiếu tại rạp rồi gửi yêu cầu đến API Gemini 2.5.
5. Hệ thống nhận phản hồi JSON có cấu trúc từ AI, hiển thị nội dung câu thoại (dưới dạng Markdown) và tự động ánh xạ poster, link chi tiết để hiển thị các card phim đề xuất.
6. Người dùng xem phản hồi và có thể bấm nút "Xem chi tiết" tại card phim đề xuất để chuyển hướng đến trang thông tin chi tiết phim đó.

**Ngoại lệ**  
*   4. Máy chủ AI mất kết nối hoặc API Key hết hạn: Hệ thống bắt lỗi ngoại lệ và hiển thị thông báo thân thiện: *"Xin lỗi bạn, hệ thống AI đang bận xử lý, bạn vui lòng thử lại sau giây lát nhé!"*.

---

#### 22. Xem hạng thành viên
**Usecase**  
Xem hạng thành viên

**Actor**  
Customer (Khách hàng)

**Tiền điều kiện**  
Người dùng đã đăng nhập thành công vào tài khoản thành viên hệ thống.

**Hậu điều kiện**  
Người dùng xem được thông tin thẻ VIP ảo, tiến độ tích lũy chi tiêu 365 ngày qua và danh sách hóa đơn tích lũy.

**Kịch bản chính**  
1. Tại thanh Header trang chủ, người dùng di chuột và nhấn chọn vào tên tài khoản của mình.
2. Menu thả xuống (dropdown) hiện ra, người dùng nhấn chọn vào mục **"Hạng thành viên"** (kèm icon vương miện).
3. Giao diện Hạng thành viên hiện ra hiển thị đầy đủ các thông tin:
    *   **Thẻ VIP ảo**: Hiển thị tên chủ tài khoản và cấp bậc thành viên tương ứng (Thường/Bạc/Vàng/Kim Cương) với màu sắc chuyển màu gradient động phù hợp.
    *   **Tiến độ tích lũy**: Số tiền đã chi tiêu tích lũy trong vòng 365 ngày qua và thanh tiến trình phần trăm thăng hạng tiếp theo.
    *   **Mốc thăng hạng**: Hiển thị số tiền còn thiếu để thăng cấp lên hạng VIP kế tiếp.
    *   **Đặc quyền các hạng**: Bảng chi tiết quyền lợi giảm giá trực tiếp (5% Bạc, 10% Vàng, 15% Kim Cương) và tô sáng hạng hiện tại của người dùng.
    *   **Lịch sử tích lũy**: Danh sách bảng chi tiết các hóa đơn thanh toán thành công trong 365 ngày qua (mã hóa đơn, thời gian thanh toán, số tiền được cộng dồn).
4. Người dùng xem thông tin và có thể nhấn vào breadcrumb "Trang chủ" để quay lại trang chính.

**Ngoại lệ**  
*   1. Người dùng chưa đăng nhập: Hệ thống tự động chuyển hướng người dùng về trang đăng nhập (`/login`).
*   3. Người dùng chưa có bất kỳ hóa đơn nào trong 365 ngày qua: Bảng lịch sử tích lũy hiển thị thông báo trống: *"Bạn chưa có giao dịch đặt vé thành công nào trong vòng 365 ngày qua để tích lũy hạng VIP."* và tiến độ tích lũy hiển thị mốc 0đ.

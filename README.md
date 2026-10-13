# website-danh-gia-xem-phim-MovieVerse

## Chạy local

1. Sao chép `.env.example` thành `.env` và đổi `ADMIN_PASSWORD`.
2. Để tự tra cứu rating IMDb khi thêm phim, đăng ký API key tại
   [omdbapi.com/apikey.aspx](https://www.omdbapi.com/apikey.aspx), xác nhận email,
   rồi thay `OMDB_API_KEY` trong `.env` bằng khóa của bạn.
3. Chạy lại máy chủ sau khi thay đổi `.env`.
4. Chạy `npm run dev:local`, sau đó mở `http://localhost:5173`.

Lệnh này khởi động cả giao diện Vite và API. Bình luận và câu trả lời được chia
sẻ qua API, lưu tại `.data/reviews.json`. Có thể đặt `REVIEWS_STORE_PATH` để
chọn vị trí lưu khác. Máy chủ triển khai cần chạy API MovieVerse, cấu hình thông
tin quản trị và cấp quyền ghi cho thư mục lưu trữ. Nếu chỉ chạy Vite
(`npm run dev`), các thao tác bình luận sẽ báo lỗi kết nối API.

Rating được tra cứu riêng qua máy chủ từ OMDb (điểm IMDb trên thang 10); khóa
API chỉ lưu ở `.env`, không gửi xuống trình duyệt. Không chia sẻ hoặc commit
khóa API. Nếu chưa cấu hình key, bạn vẫn có thể nhập rating thủ công.

Kho JSON phù hợp với một API instance có ổ đĩa bền vững; nếu chạy nhiều
instance, hãy chuyển kho bình luận sang cơ sở dữ liệu dùng chung.

# website-danh-gia-xem-phim-MovieVerse

## Chạy local

1. Sao chép `.env.example` thành `.env` và đổi `ADMIN_PASSWORD`.
2. Chạy `npm run dev:local`, sau đó mở `http://localhost:5173`.

Lệnh này khởi động cả giao diện Vite và API. Bình luận và câu trả lời được chia
sẻ qua API, lưu tại `.data/reviews.json`. Có thể đặt `REVIEWS_STORE_PATH` để
chọn vị trí lưu khác. Máy chủ triển khai cần chạy API MovieVerse, cấu hình thông
tin quản trị và cấp quyền ghi cho thư mục lưu trữ. Nếu chỉ chạy Vite
(`npm run dev`), các thao tác bình luận sẽ báo lỗi kết nối API.

Kho JSON phù hợp với một API instance có ổ đĩa bền vững; nếu chạy nhiều
instance, hãy chuyển kho bình luận sang cơ sở dữ liệu dùng chung.

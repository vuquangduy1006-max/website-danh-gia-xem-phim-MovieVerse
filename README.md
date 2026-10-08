# website-danh-gia-xem-phim-MovieVerse

## Trợ lý AI

Trợ lý dùng API tương thích OpenAI Chat Completions khi đã cấu hình key. Nếu chưa có key hoặc nhà cung cấp tạm lỗi, trợ lý vẫn trả lời câu hỏi cơ bản và gợi ý phim theo danh mục cục bộ. Khóa API chỉ được đọc ở backend, không đưa vào mã frontend.

Trợ lý có thể lọc gợi ý theo thể loại, thời lượng mong muốn, năm phát hành và điểm IMDb. Thời lượng chỉ được nêu khi có dữ liệu đã xác minh.

Trợ lý cũng nhận biết các tâm trạng phổ biến như buồn/cô đơn, cần được an ủi, muốn vui vẻ, hồi hộp, lãng mạn, cần cảm hứng, thư giãn, tò mò hoặc muốn xem kinh dị để chọn phim phù hợp trong danh mục.

1. Tạo file `.env` từ `.env.example` và điền `AI_API_KEY` hợp lệ.
2. Chạy `npm run dev:local`; lệnh này khởi động cả API và trang web.
3. Truy cập `http://localhost:5173`.

Nếu không cấu hình khóa AI hoặc khóa bị nhà cung cấp từ chối, trợ lý vẫn có thể
gợi ý phim từ danh mục nội bộ nhưng sẽ không dùng được AI trực tuyến.

Có thể đổi `AI_API_URL` và `AI_MODEL` để dùng nhà cung cấp tương thích khác. Không commit file `.env`. Khi triển khai production, chạy `server.js` trong môi trường máy chủ riêng và cấu hình reverse proxy cùng origin cho đường dẫn `/api`.

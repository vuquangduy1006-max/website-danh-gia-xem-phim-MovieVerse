# website-danh-gia-xem-phim-MovieVerse

## Trợ lý AI

Trợ lý dùng API tương thích OpenAI Chat Completions. Khóa API chỉ được đọc ở backend, không đưa vào mã frontend.

1. Tạo file `.env` từ `.env.example` và điền `AI_API_KEY`.
2. Mở terminal thứ nhất và chạy `npm run dev:api`.
3. Mở terminal thứ hai và chạy `npm run dev`, sau đó truy cập `http://localhost:5173`.

Có thể đổi `AI_API_URL` và `AI_MODEL` để dùng nhà cung cấp tương thích khác. Không commit file `.env`. Khi triển khai production, chạy `server.js` trong môi trường máy chủ riêng và cấu hình reverse proxy cùng origin cho đường dẫn `/api`.

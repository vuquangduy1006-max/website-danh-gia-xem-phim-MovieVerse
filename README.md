# website-danh-gia-xem-phim-MovieVerse

## Chạy local

1. Sao chép `.env.example` thành `.env` và đổi `ADMIN_PASSWORD`.
2. Để tự tra cứu rating IMDb khi thêm phim, đăng ký API key tại
   [omdbapi.com/apikey.aspx](https://www.omdbapi.com/apikey.aspx), xác nhận email,
   rồi thay `OMDB_API_KEY` trong `.env` bằng khóa của bạn.
3. Để bổ sung ảnh nền, ekip và trailer, đăng ký API key TMDb tại
   [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api), rồi
   điền `TMDB_API_KEY` trong `.env`. Khóa này là tùy chọn; giữ khóa ở máy chủ.
4. Chạy lại máy chủ sau khi thay đổi `.env`.
5. Chạy `npm run dev:local`, sau đó mở `http://localhost:5173`.

Lệnh này khởi động cả giao diện Vite và API. Bình luận và câu trả lời được chia
sẻ qua API, lưu tại `.data/reviews.json`. Có thể đặt `REVIEWS_STORE_PATH` để
chọn vị trí lưu khác. Máy chủ triển khai cần chạy API MovieVerse, cấu hình thông
tin quản trị và cấp quyền ghi cho thư mục lưu trữ. Nếu chỉ chạy Vite
(`npm run dev`), các thao tác bình luận sẽ báo lỗi kết nối API.

Danh mục phim và thể loại được lưu chung tại `.data/catalog.json`; chỉ quản trị
viên đã đăng nhập mới có thể thay đổi. Có thể đặt `MOVIE_CATALOG_STORE_PATH` để
chọn vị trí lưu khác. Khi kho này chưa có chỉnh sửa, lần đăng nhập quản trị đầu
tiên sẽ chuyển danh mục phim cũ trên trình duyệt đó lên máy chủ. Kho JSON yêu
cầu một API instance có ổ đĩa bền vững.

Tài khoản người dùng được lưu tại `.data/users.json`; mật khẩu được băm bằng
scrypt trước khi ghi vào kho. Có thể đặt `AUTH_USERS_STORE_PATH` để chọn vị trí
lưu khác. Tài khoản người dùng cũ trên trình duyệt được chuyển lên máy chủ sau
khi đăng nhập thành công lần đầu. Phiên đăng nhập hết hạn sau 12 giờ, hoặc 30
ngày nếu chọn “Ghi nhớ đăng nhập”. Khôi phục mật khẩu qua email chưa được hỗ trợ.
Người dùng đã đăng nhập có thể đổi mật khẩu từ menu tài khoản; thao tác này thu hồi các phiên đăng nhập hiện có và yêu cầu đăng nhập lại.

Email đăng ký nhận tin được lưu tại `.data/newsletter.json`; có thể đặt
`NEWSLETTER_STORE_PATH` để chọn vị trí khác. Hiện email chỉ được lưu khi người
dùng chủ động đồng ý; có thể hủy đăng ký bằng cách nhập lại email trên trang
chủ. Website chưa tích hợp dịch vụ gửi bản tin tự động.

Trang `/info.html` cung cấp phần giới thiệu, trợ giúp, điều khoản và mô tả dữ
liệu được lưu để người dùng biết rõ giới hạn hiện tại của website.

Khi nhập tên phim trong form quản trị, máy chủ tra cứu OMDb để tự điền các thông
tin phim có sẵn (năm, ngày phát hành, rating IMDb, quốc gia, thời lượng, ngôn ngữ,
phân loại độ tuổi, thể loại, poster, mô tả, đạo diễn, diễn viên, biên kịch,
hãng sản xuất, giải thưởng, doanh thu và website chính thức). Trailer có sẵn trong thư viện MovieVerse sẽ được
điền nếu ô trailer còn trống. Khi cấu hình `TMDB_API_KEY`, tra cứu bổ sung ảnh
nền, nhà sản xuất, quay phim, âm nhạc và trailer YouTube chính thức. Link từng
tập cần tự cung cấp; nguồn metadata không cung cấp link xem tập. Trường không
có dữ liệu vẫn có thể nhập thủ công. Khóa API chỉ lưu ở `.env`, không gửi xuống
trình duyệt. Không chia sẻ hoặc commit khóa API. Nếu chưa cấu hình key, bạn vẫn
có thể nhập dữ liệu thủ công. Khi dùng dữ liệu TMDb, trang phim hiển thị thông
báo ghi nhận TMDb theo yêu cầu sử dụng API.

Các kho JSON phù hợp với một API instance có ổ đĩa bền vững; nếu chạy nhiều
instance, hãy chuyển kho danh mục phim, bình luận, tài khoản và email đăng ký
sang cơ sở dữ liệu dùng chung.

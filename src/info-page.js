import "./style.css";
import "./info-page.css";
import { initializeCatalog } from "./data/data.js";
import {
  bindAccountActions,
  renderAccountActions,
  renderFooter,
  renderHeader,
} from "./components/index.js";

await initializeCatalog();

const headerActions = `${renderAccountActions()}<button class="menu-toggle" aria-label="Mở menu" aria-expanded="false">☰</button>`;

document.querySelector("#app").innerHTML = `
  ${renderHeader({
    headerClass: " new-page-header",
    homeHref: "/",
    homeActive: "",
    homeCurrent: "",
    newMoviesHref: "/new-movies.html",
    newMoviesActive: "",
    newMoviesCurrent: "",
    genresHref: "/genres.html",
    reviewsHref: "/reviews.html",
    reviewsActive: "",
    reviewsCurrent: "",
    favoritesHref: "/favorites.html",
    favoritesActive: "",
    favoritesCurrent: "",
    rankingHref: "/ranking.html",
    rankingActive: "",
    rankingCurrent: "",
    headerActions,
  })}

  <main class="info-page">
    <section class="info-intro">
      <div class="container">
        <p class="eyebrow">MovieVerse · Thông tin</p>
        <h1>Thông tin & trợ giúp</h1>
        <p>Giới thiệu về website, hướng dẫn sử dụng và các nguyên tắc minh bạch khi tham gia cộng đồng.</p>
        <nav class="info-nav" aria-label="Các mục thông tin">
          <a href="#about">Về chúng tôi</a>
          <a href="#help">Trợ giúp</a>
          <a href="#terms">Điều khoản</a>
          <a href="#privacy">Quyền riêng tư</a>
        </nav>
      </div>
    </section>

    <div class="container info-content">
      <section class="info-section" id="about" aria-labelledby="aboutHeading">
        <p class="eyebrow">01 · Giới thiệu</p>
        <h2 id="aboutHeading">Về MovieVerse</h2>
        <p>MovieVerse là website khám phá phim, lưu danh sách yêu thích, theo dõi lịch sử xem và chia sẻ đánh giá. Thông tin phim có thể được bổ sung từ các nguồn dữ liệu bên thứ ba; MovieVerse không đại diện cho hãng phim hoặc các dịch vụ phát hành nội dung.</p>
        <p>Danh mục và nguồn phát thay đổi theo dữ liệu hiện có. Không phải phim nào cũng có nội dung xem trực tiếp trên website.</p>
      </section>

      <section class="info-section" id="help" aria-labelledby="helpHeading">
        <p class="eyebrow">02 · Hướng dẫn</p>
        <h2 id="helpHeading">Trợ giúp</h2>
        <div class="info-help-grid">
          <article>
            <h3>Tìm và khám phá phim</h3>
            <p>Dùng ô tìm kiếm ở đầu trang, chọn thể loại hoặc mở trang phim mới và bảng xếp hạng để duyệt danh mục.</p>
          </article>
          <article>
            <h3>Tài khoản và danh sách cá nhân</h3>
            <p>Tạo tài khoản để đăng nhập. Phim yêu thích, lịch sử xem và vị trí xem được lưu trên trình duyệt hiện tại, nên chưa đồng bộ giữa các thiết bị.</p>
          </article>
          <article>
            <h3>Danh mục phim</h3>
            <p>Danh mục phim và thể loại được quản trị viên cập nhật trên máy chủ để mọi khách truy cập cùng xem một dữ liệu.</p>
          </article>
          <article>
            <h3>Đánh giá và bình luận</h3>
            <p>Mở trang chi tiết phim để gửi đánh giá. Nếu API không kết nối được, hãy chạy cả giao diện và máy chủ bằng <code>npm run dev:local</code>.</p>
          </article>
          <article>
            <h3>Không phát được phim</h3>
            <p>Một số phim chưa có nguồn phát hoặc phụ thuộc dịch vụ bên ngoài. Thử tải lại trang, kiểm tra kết nối hoặc quay lại trang chi tiết để xem trailer khả dụng.</p>
          </article>
        </div>
        <p class="info-note">Website chưa có chức năng đặt lại mật khẩu hoặc kênh hỗ trợ trực tiếp. Các liên kết mạng xã hội sẽ được cập nhật khi có địa chỉ chính thức.</p>
      </section>

      <section class="info-section" id="terms" aria-labelledby="termsHeading">
        <p class="eyebrow">03 · Cộng đồng</p>
        <h2 id="termsHeading">Điều khoản sử dụng</h2>
        <ul>
          <li>Sử dụng website đúng mục đích; không đăng nội dung bất hợp pháp, quấy rối, tiết lộ dữ liệu cá nhân của người khác hoặc cố gắng làm gián đoạn dịch vụ.</li>
          <li>Bạn chịu trách nhiệm về nội dung đánh giá và bình luận mình gửi. Nội dung vi phạm có thể bị ẩn hoặc xóa theo quyết định kiểm duyệt.</li>
          <li>Thông tin, điểm số, trailer và nguồn phát có thể không đầy đủ, thay đổi hoặc do bên thứ ba cung cấp. Hãy kiểm tra nguồn gốc trước khi dựa vào thông tin đó.</li>
          <li>Tài khoản là cá nhân; hãy giữ bí mật thông tin đăng nhập và báo với người quản lý website nếu nghi ngờ tài khoản bị sử dụng trái phép.</li>
          <li>Các tính năng và điều khoản có thể được cập nhật khi website thay đổi. Ngày cập nhật gần nhất được ghi ở cuối trang.</li>
        </ul>
      </section>

      <section class="info-section" id="privacy" aria-labelledby="privacyHeading">
        <p class="eyebrow">04 · Dữ liệu</p>
        <h2 id="privacyHeading">Quyền riêng tư</h2>
        <ul>
          <li>Khi đăng ký, tên hiển thị, email và mật khẩu đã băm được lưu trên máy chủ để cung cấp tài khoản. Mật khẩu gốc không được lưu trong kho tài khoản.</li>
          <li>Phiên đăng nhập được lưu trong bộ nhớ phiên của trình duyệt hoặc bộ nhớ cục bộ nếu chọn “Ghi nhớ đăng nhập”. Đăng xuất sẽ yêu cầu máy chủ thu hồi phiên.</li>
          <li>Danh sách yêu thích, lịch sử xem và tiến độ phát được lưu cục bộ trên thiết bị của bạn. Xóa dữ liệu website trong trình duyệt có thể xóa các mục này.</li>
          <li>Đánh giá và bình luận được gửi tới máy chủ để hiển thị trong cộng đồng.</li>
          <li>Email chỉ được lưu vào danh sách quan tâm nhận tin sau khi bạn đồng ý. Hiện MovieVerse chưa gửi email bản tin tự động; bạn có thể hủy đăng ký bằng cách nhập lại email đã dùng trên trang chủ.</li>
          <li>Nếu sử dụng trợ lý gợi ý, câu hỏi và dữ liệu danh mục cần thiết được gửi tới máy chủ MovieVerse; tùy cấu hình, yêu cầu có thể được chuyển tiếp tới nhà cung cấp AI.</li>
        </ul>
        <p>Để xóa dữ liệu cục bộ, hãy xóa dữ liệu website trong cài đặt trình duyệt. Website hiện chưa có chức năng tự xóa tài khoản hoặc yêu cầu xóa dữ liệu từ giao diện.</p>
      </section>

      <p class="info-updated">Cập nhật lần cuối: 17/10/2026</p>
    </div>
  </main>

  ${renderFooter({
    footerClass: " new-page-footer",
    homeHref: "/",
    newMoviesHref: "/new-movies.html",
    rankingHref: "/ranking.html",
    genresHref: "/genres.html",
  })}
`;

bindAccountActions();

document.querySelector(".menu-toggle").addEventListener("click", (event) => {
  const isOpen = document
    .querySelector(".main-nav")
    .classList.toggle("mobile-open");
  event.currentTarget.setAttribute("aria-expanded", String(isOpen));
});

if (window.location.hash) {
  document.fonts.ready.then(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const target = document.getElementById(window.location.hash.slice(1));
        if (!target) return;
        window.scrollTo({
          top: target.getBoundingClientRect().top + window.scrollY - 96,
          behavior: "instant",
        });
      });
    });
  });
}

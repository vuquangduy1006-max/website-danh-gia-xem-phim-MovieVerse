import "./admin/admin.css";
import "./admin-comments.css";
import { isAdmin } from "./data/auth.js";
import { deleteReview, loadReviews, replyToReview } from "./data/reviews.js";

if (!isAdmin()) {
  window.location.replace("/login.html?next=/admin/comments.html");
} else {
  let reviews = loadReviews();
  let query = "";
  let ratingFilter = "all";

  document.querySelector("#app").innerHTML = `
    <header class="admin-header">
      <div class="container header-inner">
        <a class="brand" href="/" aria-label="MovieVerse trang chủ"><span class="brand-mark">M</span><span>movie<span>verse</span></span></a>
        <nav class="admin-nav" aria-label="Điều hướng quản trị">
          <a href="/admin/admin.html">Quản lý phim</a>
          <a href="/admin/genres.html">Thể loại</a>
          <a class="active" href="/admin/comments.html">Bình luận</a>
          <a href="/" class="back-link">← Trang chủ</a>
        </nav>
        <div class="header-actions"><span class="admin-role">ADMIN</span></div>
      </div>
    </header>
    <main class="admin-main comments-admin-main">
      <div class="container">
        <div class="admin-heading">
          <div><p class="eyebrow">Kiểm duyệt cộng đồng</p><h1>Quản lý bình luận</h1><p>Theo dõi và xử lý các bình luận trên MovieVerse.</p></div>
        </div>
        <div class="comment-overview" id="commentOverview"></div>
        <section class="admin-panel comment-management-panel">
          <div class="panel-toolbar"><input class="toolbar-input" id="commentSearch" type="search" placeholder="Tìm theo người dùng, phim hoặc nội dung..."><select class="toolbar-select" id="commentRating" aria-label="Lọc theo số sao"><option value="all">Tất cả đánh giá</option><option value="5">5 sao</option><option value="4">4 sao</option><option value="3">3 sao</option><option value="2">2 sao</option><option value="1">1 sao</option></select></div>
          <div class="comment-list" id="commentList"></div>
        </section>
      </div>
    </main>
    <footer class="admin-footer"><div class="container"><span>© 2024 MovieVerse Admin.</span><span>Kiểm duyệt bình luận</span></div></footer>
    <div class="toast" id="toast"></div>
  `;

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  }
  function render() {
    const normalized = query.trim().toLocaleLowerCase("vi");
    const shown = reviews.filter((review) => {
      const matchesQuery = !normalized || `${review.author} ${review.movieTitle} ${review.comment}`.toLocaleLowerCase("vi").includes(normalized);
      const matchesRating = ratingFilter === "all" || Number(review.rating) === Number(ratingFilter);
      return matchesQuery && matchesRating;
    });
    const average = reviews.length ? (reviews.reduce((sum, review) => sum + Number(review.rating), 0) / reviews.length).toFixed(1) : "0.0";
    document.querySelector("#commentOverview").innerHTML = `<div><span>Tổng bình luận</span><strong>${reviews.length}</strong><small>tất cả đánh giá</small></div><div><span>Điểm trung bình</span><strong class="gold-text">${average}</strong><small>trên 5 sao</small></div><div><span>Đang hiển thị</span><strong class="accent-text">${shown.length}</strong><small>theo bộ lọc hiện tại</small></div>`;
    document.querySelector("#commentList").innerHTML = shown.length ? shown.map((review) => `<article class="admin-comment-card"><div class="admin-comment-avatar">${escapeHtml(review.author.charAt(0))}</div><div class="admin-comment-body"><div class="admin-comment-head"><div><strong>${escapeHtml(review.author)}</strong><span>${escapeHtml(review.movieTitle)}</span></div><time>${escapeHtml(review.date)}</time></div><div class="admin-comment-rating">${"★".repeat(Number(review.rating))}${"☆".repeat(5 - Number(review.rating))}<b>${review.rating}/5</b></div><p>${escapeHtml(review.comment)}</p>${review.adminReply ? `<div class="admin-reply"><strong>Đã phản hồi</strong><p>${escapeHtml(review.adminReply.comment)}</p><small>${escapeHtml(review.adminReply.date)}</small></div>` : ""}</div><div class="admin-comment-actions"><button class="btn btn-ghost btn-sm" type="button" data-reply="${escapeHtml(review.id)}">${review.adminReply ? "Sửa phản hồi" : "Phản hồi"}</button><button class="btn btn-danger btn-sm" type="button" data-delete="${escapeHtml(review.id)}">Xóa</button></div></article>`).join("") : '<div class="empty-state"><h3>Không tìm thấy bình luận</h3><p>Thử thay đổi từ khóa hoặc bộ lọc.</p></div>';
  }
  document.querySelector("#commentSearch").addEventListener("input", (event) => { query = event.target.value; render(); });
  document.querySelector("#commentRating").addEventListener("change", (event) => { ratingFilter = event.target.value; render(); });
  document.querySelector("#commentList").addEventListener("click", (event) => {
    const replyButton = event.target.closest("[data-reply]");
    if (replyButton) {
      const review = reviews.find((item) => item.id === replyButton.dataset.reply);
      if (!review) return;
      const reply = window.prompt("Nhập phản hồi cho User:", review.adminReply?.comment || "");
      if (reply === null || !reply.trim()) return;
      replyToReview(review.id, reply);
      reviews = loadReviews();
      render();
      return;
    }
    const button = event.target.closest("[data-delete]");
    if (!button) return;
    const review = reviews.find((item) => item.id === button.dataset.delete);
    if (!review || !window.confirm(`Xóa bình luận của ${review.author}?`)) return;
    deleteReview(review.id);
    reviews = loadReviews();
    render();
  });
  render();
}

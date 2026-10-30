import "./admin/admin.css";
import "./admin-comments.css";
import { renderAdminHeader } from "./data/admin-navigation.js";
import { isAdmin } from "./data/auth.js";
import {
  addReviewReply,
  deleteReview,
  getReviewReplies,
  loadReviews,
  setReviewHidden,
  syncReviews,
} from "./data/reviews.js";

try {
  await syncReviews();
} catch (error) {
  console.error("Không thể đồng bộ bình luận:", error);
}

if (!isAdmin()) {
  window.location.replace("/login.html?next=/admin/comments.html");
} else {
  let reviews = loadReviews();
  let query = "";
  let ratingFilter = "all";
  let hiddenFilter = "visible";

  document.querySelector("#app").innerHTML = `
    ${renderAdminHeader("/admin/comments.html")}
    <main class="admin-main comments-admin-main">
      <div class="container">
        <div class="admin-heading">
          <div><p class="eyebrow">Kiểm duyệt cộng đồng</p><h1>Quản lý bình luận</h1><p>Theo dõi và xử lý các bình luận trên MovieVerse.</p></div>
        </div>
        <div class="comment-overview" id="commentOverview"></div>
        <section class="admin-panel comment-management-panel">
          <div class="panel-toolbar">
            <input class="toolbar-input" id="commentSearch" type="search" placeholder="Tìm theo người dùng, phim hoặc nội dung...">
            <select class="toolbar-select" id="commentRating" aria-label="Lọc theo số sao">
              <option value="all">Tất cả đánh giá</option>
              <option value="5">5 sao</option>
              <option value="4">4 sao</option>
              <option value="3">3 sao</option>
              <option value="2">2 sao</option>
              <option value="1">1 sao</option>
            </select>
            <select class="toolbar-select" id="commentVisibility" aria-label="Lọc theo trạng thái hiển thị">
              <option value="visible">Đang hiển thị</option>
              <option value="all">Tất cả</option>
              <option value="hidden">Đã ẩn</option>
            </select>
          </div>
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
    const visibleReviews = reviews.filter((review) => !review.hidden);
    const shown = reviews.filter((review) => {
      const matchesQuery = !normalized || `${review.author} ${review.movieTitle} ${review.comment}`.toLocaleLowerCase("vi").includes(normalized);
      const matchesRating = ratingFilter === "all" || Number(review.rating) === Number(ratingFilter);
      const matchesVisibility =
        hiddenFilter === "all" ||
        (hiddenFilter === "visible" && !review.hidden) ||
        (hiddenFilter === "hidden" && review.hidden);
      return matchesQuery && matchesRating && matchesVisibility;
    });
    const average = reviews.length ? (reviews.reduce((sum, review) => sum + Number(review.rating), 0) / reviews.length).toFixed(1) : "0.0";
    document.querySelector("#commentOverview").innerHTML = `
      <div><span>Tổng bình luận</span><strong>${reviews.length}</strong><small>tất cả đánh giá</small></div>
      <div><span>Điểm trung bình</span><strong class="gold-text">${average}</strong><small>trên 5 sao</small></div>
      <div><span>Đang hiển thị</span><strong class="accent-text">${visibleReviews.length}</strong><small>đang hoạt động</small></div>
    `;
    document.querySelector("#commentList").innerHTML = shown.length ? shown.map((review) => {
      const replies = getReviewReplies(review);
      return `<article class="admin-comment-card ${review.hidden ? "is-hidden" : ""}"><div class="admin-comment-avatar">${escapeHtml(review.author.charAt(0))}</div><div class="admin-comment-body"><div class="admin-comment-head"><div><strong>${escapeHtml(review.author)}</strong><span>${escapeHtml(review.movieTitle)}</span></div><time>${escapeHtml(review.date)}</time></div><div class="admin-comment-rating">${"★".repeat(Number(review.rating))}${"☆".repeat(5 - Number(review.rating))}<b>${review.rating}/5</b></div><p>${escapeHtml(review.comment)}</p>${review.hidden ? '<div class="admin-status-hidden">Đã ẩn khỏi người dùng</div>' : ""}${replies.length ? `<div class="admin-reply-thread">${replies.map((reply) => `<div class="admin-reply${reply.role === "admin" ? " is-admin" : ""}"><div><strong>${escapeHtml(reply.author)}</strong>${reply.role === "admin" ? '<span class="reply-admin-badge">ADMIN</span>' : ""}<small>${escapeHtml(reply.date)}</small></div><p>${escapeHtml(reply.comment)}</p></div>`).join("")}</div>` : ""}</div><div class="admin-comment-actions"><button class="btn btn-ghost btn-sm" type="button" data-reply="${escapeHtml(review.id)}">Phản hồi</button><button class="btn btn-ghost btn-sm" type="button" data-toggle-hidden="${escapeHtml(review.id)}">${review.hidden ? "Hiện" : "Ẩn"}</button><button class="btn btn-danger btn-sm" type="button" data-delete="${escapeHtml(review.id)}">Xóa</button></div></article>`;
    }).join("") : '<div class="empty-state"><h3>Không tìm thấy bình luận</h3><p>Thử thay đổi từ khóa hoặc bộ lọc.</p></div>';
  }
  document.querySelector("#commentSearch").addEventListener("input", (event) => { query = event.target.value; render(); });
  document.querySelector("#commentRating").addEventListener("change", (event) => { ratingFilter = event.target.value; render(); });
  document.querySelector("#commentVisibility").addEventListener("change", (event) => { hiddenFilter = event.target.value; render(); });
  document.querySelector("#commentList").addEventListener("click", async (event) => {
    const replyButton = event.target.closest("[data-reply]");
    if (replyButton) {
      const review = reviews.find((item) => item.id === replyButton.dataset.reply);
      if (!review) return;
      const reply = window.prompt("Nhập phản hồi cho User:");
      if (reply === null || !reply.trim()) return;
      try {
        await addReviewReply(review.id, reply);
      } catch (error) {
        window.alert(error.message);
        return;
      }
      reviews = loadReviews();
      render();
      return;
    }

    const toggleButton = event.target.closest("[data-toggle-hidden]");
    if (toggleButton) {
      const review = reviews.find((item) => item.id === toggleButton.dataset.toggleHidden);
      if (!review) return;
      try {
        await setReviewHidden(review.id, !review.hidden);
      } catch (error) {
        window.alert(error.message);
        return;
      }
      reviews = loadReviews();
      render();
      return;
    }

    const button = event.target.closest("[data-delete]");
    if (!button) return;
    const review = reviews.find((item) => item.id === button.dataset.delete);
    if (!review || !window.confirm(`Xóa bình luận của ${review.author}?`)) return;
    try {
      await deleteReview(review.id);
    } catch (error) {
      window.alert(error.message);
      return;
    }
    reviews = loadReviews();
    render();
  });
  render();
}

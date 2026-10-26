import { changePassword, getSession } from "./data/auth.js";
import { setupPasswordToggle } from "./password-toggle.js";
import { loadReviews, syncReviews } from "./data/reviews.js";
import { movieSeed } from "./data/data.js";

const form = document.querySelector("#passwordForm");
const session = getSession();

if (session && session.role === "user") {
  const name = session.name || "Thành viên MovieVerse";
  const email = session.email || "";

  const profileName = document.querySelector("#profileName");
  const profileEmail = document.querySelector("#profileEmail");
  const profileAvatar = document.querySelector("#profileAvatar");

  if (profileName) {
    profileName.textContent = name;
  }

  if (profileEmail) {
    profileEmail.textContent = email;
  }

  if (profileAvatar) {
    profileAvatar.textContent =
      name.trim().charAt(0).toUpperCase() || "U";
  }
}

if (!session || session.role !== "user") {
  window.location.replace(
    session?.role === "admin" ? "/admin/admin.html" : "/login.html?next=%2Faccount.html",
  );
} else if (form) {
  setupPasswordToggle();
  const message = document.createElement("p");
  message.className = "auth-message";
  message.setAttribute("aria-live", "polite");
  form.append(message);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const currentPassword = String(data.get("currentPassword") || "");
    const newPassword = String(data.get("newPassword") || "");
    const confirmPassword = String(data.get("confirmPassword") || "");
    const submitButton = form.querySelector('[type="submit"]');
    if (newPassword !== confirmPassword) {
      message.textContent = "Mật khẩu mới nhập lại chưa khớp.";
      message.classList.add("is-error");
      return;
    }

    submitButton.disabled = true;
    let result;
    try {
      result = await changePassword(currentPassword, newPassword);
    } catch (error) {
      result = {
        ok: false,
        message: error.message || "Không thể đổi mật khẩu.",
      };
    } finally {
      submitButton.disabled = false;
    }

    message.textContent = result.message;
    message.classList.toggle("is-error", !result.ok);
    if (result.ok) {
      localStorage.setItem(
        "movieverse_auth_notice",
        "Đổi mật khẩu thành công. Hãy đăng nhập bằng mật khẩu mới.",
      );
      window.setTimeout(() => {
        window.location.href = "/login.html";
      }, 450);
    }
  });
}
// Hiển thị lịch sử bình luận của tài khoản đang đăng nhập
async function renderMyReviewHistory() {
  const container = document.querySelector("#myReviewHistory");

  if (!container || !session || session.role !== "user") return;

  container.textContent = "Đang tải lịch sử bình luận...";

  // Đồng bộ bình luận mới nhất từ máy chủ
  try {
    await syncReviews();
  } catch (error) {
    console.warn("Không thể đồng bộ bình luận:", error);
  }

  const reviews = loadReviews();

  const myReviews = reviews
    .filter((review) => {
      return (
        review.author === session.name &&
        !review.hidden
      );
    })
    .sort((a, b) => {
      return new Date(b.date || 0) - new Date(a.date || 0);
    });

  container.innerHTML = "";

  if (myReviews.length === 0) {
    const empty = document.createElement("p");
    empty.textContent = "Bạn chưa có bình luận nào.";
    container.appendChild(empty);
    return;
  }

  myReviews.forEach((review) => {
    const item = document.createElement("article");
    item.className = "profile-review-item";

    const movieTitle = document.createElement("h4");

const movie = movieSeed.find(
  (item) => item.title === review.movieTitle
);

if (movie) {
  const movieLink = document.createElement("a");
  movieLink.href = `/watch.html?id=${encodeURIComponent(movie.id)}`;
  movieLink.textContent = review.movieTitle;

  movieTitle.appendChild(movieLink);
} else {
  movieTitle.textContent = review.movieTitle || "Phim không xác định";
}

    const rating = document.createElement("p");
    rating.textContent = `Đánh giá: ${review.rating || 0}/5 sao`;

    const comment = document.createElement("p");
    comment.textContent = review.comment || "";

    const date = document.createElement("small");
    if (review.date) {
      const parsedDate = new Date(review.date);
      date.textContent = Number.isNaN(parsedDate.getTime())
        ? String(review.date)
        : parsedDate.toLocaleDateString("vi-VN");
    }

    item.append(movieTitle, rating, comment, date);
    container.appendChild(item);
  });
}

renderMyReviewHistory();
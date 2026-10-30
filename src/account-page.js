import { changePassword, getSession, updateUserProfile } from "./data/auth.js";
import { setupPasswordToggle } from "./password-toggle.js";
import { loadReviews, syncReviews } from "./data/reviews.js";
import { movieSeed } from "./data/data.js";

const form = document.querySelector("#passwordForm");
const profileForm = document.querySelector("#profileForm");
let session = getSession();

function renderProfileAvatar(avatar, name) {
  const profileAvatar = document.querySelector("#profileAvatar");
  if (!profileAvatar) return;

  profileAvatar.replaceChildren();
  if (avatar) {
    const image = document.createElement("img");
    image.src = avatar;
    image.alt = "";
    profileAvatar.appendChild(image);
  } else {
    profileAvatar.textContent = name.trim().charAt(0).toUpperCase() || "U";
  }
}

if (session && session.role === "user") {
  const name = session.name || "Thành viên MovieVerse";
  const email = session.email || "";

  const profileName = document.querySelector("#profileName");
  const profileEmail = document.querySelector("#profileEmail");
  const joined = session.createdAt
    ? new Date(session.createdAt).toLocaleDateString("vi-VN")
    : "Thành viên MovieVerse";

  if (profileName) {
    profileName.textContent = name;
  }

  if (profileEmail) {
    profileEmail.textContent = email;
  }

  document.querySelector("#profileNickname").value = name;
  document.querySelector("#profileBio").value = session.bio || "";
  document.querySelector("#profileEmailInput").value = email;
  document.querySelector("#profileJoined").textContent = `Tham gia ${joined}`;
  document.querySelector("#profileJoinedSummary").textContent = joined;
  renderProfileAvatar(session.avatar || "", name);
}

if (!session || session.role !== "user") {
  window.location.replace(
    session?.role === "admin" ? "/admin/admin.html" : "/login.html?next=%2Faccount.html",
  );
} else if (form) {
  setupPasswordToggle();
  let avatar = session.avatar || "";
  const avatarInput = document.querySelector("#avatarInput");
  const chooseAvatarButton = document.querySelector("#chooseAvatarButton");
  const profileMessage = document.querySelector("#profileMessage");
  const profileNickname = document.querySelector("#profileNickname");
  const profileBio = document.querySelector("#profileBio");

  chooseAvatarButton.addEventListener("click", () => avatarInput.click());
  avatarInput.addEventListener("change", async () => {
    const file = avatarInput.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      profileMessage.textContent = "Chỉ hỗ trợ ảnh JPG, PNG hoặc WebP.";
      profileMessage.classList.add("is-error");
      avatarInput.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      profileMessage.textContent = "Ảnh đại diện cần nhỏ hơn 5 MB.";
      profileMessage.classList.add("is-error");
      avatarInput.value = "";
      return;
    }

    try {
      const bitmap = await createImageBitmap(file);
      const size = Math.min(bitmap.width, bitmap.height, 240);
      const sourceX = (bitmap.width - size) / 2;
      const sourceY = (bitmap.height - size) / 2;
      const canvas = document.createElement("canvas");
      canvas.width = 240;
      canvas.height = 240;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Trình duyệt không thể xử lý ảnh này.");
      context.drawImage(bitmap, sourceX, sourceY, size, size, 0, 0, 240, 240);
      bitmap.close();

      let blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/webp", 0.78),
      );
      if (!blob) {
        blob = await new Promise((resolve) =>
          canvas.toBlob(resolve, "image/jpeg", 0.72),
        );
      }
      if (!blob || blob.size > 27_000) {
        throw new Error("Ảnh sau khi xử lý vẫn quá lớn. Hãy chọn ảnh khác.");
      }

      const reader = new FileReader();
      reader.onload = () => {
        avatar = String(reader.result);
        renderProfileAvatar(avatar, profileNickname.value);
        profileMessage.textContent = "Ảnh đã sẵn sàng. Nhấn Lưu thay đổi để áp dụng.";
        profileMessage.classList.remove("is-error");
      };
      reader.onerror = () => {
        profileMessage.textContent = "Không thể đọc ảnh. Vui lòng thử lại.";
        profileMessage.classList.add("is-error");
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      profileMessage.textContent = error.message || "Không thể xử lý ảnh đại diện.";
      profileMessage.classList.add("is-error");
    } finally {
      avatarInput.value = "";
    }
  });

  profileForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submitButton = profileForm.querySelector('[type="submit"]');
    submitButton.disabled = true;
    profileMessage.textContent = "";
    profileMessage.classList.remove("is-error");

    let result;
    try {
      result = await updateUserProfile({
        name: profileNickname.value,
        bio: profileBio.value,
        avatar,
      });
    } catch (error) {
      result = { ok: false, message: error.message || "Không thể cập nhật hồ sơ." };
    } finally {
      submitButton.disabled = false;
    }

    profileMessage.textContent = result.message;
    profileMessage.classList.toggle("is-error", !result.ok);
    if (result.ok) {
      session = result.session;
      document.querySelector("#profileName").textContent = session.name;
      renderProfileAvatar(session.avatar, session.name);
    }
  });

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
import { changePassword, getSession } from "./data/auth.js";

const form = document.querySelector("#passwordForm");
const session = getSession();

if (!session || session.role !== "user") {
  window.location.replace(
    session?.role === "admin" ? "/admin/admin.html" : "/login.html?next=%2Faccount.html",
  );
} else if (form) {
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

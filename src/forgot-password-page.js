import { requestPasswordReset, resetPasswordWithCode } from "./data/auth.js";

const requestForm = document.querySelector("#forgotRequestForm");
const resetForm = document.querySelector("#forgotResetForm");
const subtitle = document.querySelector("#authSubtitle");
const demoHintBox = document.querySelector("#demoHintBox");
const demoCodeDisplay = document.querySelector("#demoCodeDisplay");
const autoFillCodeBtn = document.querySelector("#autoFillCodeBtn");
const changeEmailBtn = document.querySelector("#changeEmailBtn");
const resendCodeBtn = document.querySelector("#resendCodeBtn");

const emailInput = document.querySelector("#forgotEmail");
const resetTargetEmail = document.querySelector("#resetTargetEmail");
const resetCodeInput = document.querySelector("#resetCode");
const newPasswordInput = document.querySelector("#resetNewPassword");
const confirmPasswordInput = document.querySelector("#resetConfirmPassword");

// Message container for request form
const requestMessage = document.createElement("p");
requestMessage.className = "auth-message";
requestMessage.setAttribute("aria-live", "polite");
requestForm.append(requestMessage);

// Message container for reset form
const resetMessage = document.createElement("p");
resetMessage.className = "auth-message";
resetMessage.setAttribute("aria-live", "polite");
resetForm.append(resetMessage);

let currentResetEmail = "";

function switchToResetStep(email, resetCode) {
  currentResetEmail = email;
  resetTargetEmail.value = email;

  requestForm.style.display = "none";
  resetForm.style.display = "grid";

  subtitle.textContent = `Nhập mã xác thực đã gửi tới ${email} và mật khẩu mới của bạn.`;

  if (resetCode) {
    demoHintBox.style.display = "flex";
    demoCodeDisplay.textContent = resetCode;
    autoFillCodeBtn.onclick = () => {
      resetCodeInput.value = resetCode;
      resetCodeInput.focus();
    };
  } else {
    demoHintBox.style.display = "none";
  }

  resetCodeInput.value = "";
  newPasswordInput.value = "";
  confirmPasswordInput.value = "";
  resetMessage.textContent = "";
  resetCodeInput.focus();
}

function switchToRequestStep() {
  resetForm.style.display = "none";
  requestForm.style.display = "grid";
  subtitle.textContent =
    "Nhập email tài khoản của bạn để nhận mã xác thực đặt lại mật khẩu mới.";
  requestMessage.textContent = "";
  emailInput.focus();
}

// Step 1: Submit email to request OTP
requestForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = emailInput.value.trim().toLowerCase();
  const submitBtn = document.querySelector("#requestSubmitBtn");

  submitBtn.disabled = true;
  requestMessage.textContent = "Đang kiểm tra và tạo mã xác thực...";
  requestMessage.classList.remove("is-error");

  try {
    const result = await requestPasswordReset(email);
    if (result.ok) {
      switchToResetStep(email, result.resetCode);
    } else {
      requestMessage.textContent = result.message;
      requestMessage.classList.add("is-error");
    }
  } catch (error) {
    requestMessage.textContent = error.message || "Không thể gửi yêu cầu đặt lại mật khẩu.";
    requestMessage.classList.add("is-error");
  } finally {
    submitBtn.disabled = false;
  }
});

// Step 2: Submit code and new password
resetForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = currentResetEmail;
  const code = resetCodeInput.value.trim();
  const newPassword = newPasswordInput.value;
  const confirmPassword = confirmPasswordInput.value;
  const submitBtn = document.querySelector("#resetSubmitBtn");

  if (newPassword !== confirmPassword) {
    resetMessage.textContent = "Mật khẩu mới nhập lại chưa khớp.";
    resetMessage.classList.add("is-error");
    confirmPasswordInput.focus();
    return;
  }

  if (newPassword.length < 8 || newPassword.length > 128) {
    resetMessage.textContent = "Mật khẩu mới phải có từ 8 đến 128 ký tự.";
    resetMessage.classList.add("is-error");
    newPasswordInput.focus();
    return;
  }

  submitBtn.disabled = true;
  resetMessage.textContent = "Đang cập nhật mật khẩu...";
  resetMessage.classList.remove("is-error");

  try {
    const result = await resetPasswordWithCode({ email, code, newPassword });
    if (result.ok) {
      resetMessage.textContent = "Đặt lại mật khẩu thành công! Đang chuyển đến trang đăng nhập...";
      resetMessage.classList.remove("is-error");

      localStorage.setItem(
        "movieverse_auth_notice",
        "Đặt lại mật khẩu thành công. Hãy đăng nhập bằng mật khẩu mới.",
      );

      window.setTimeout(() => {
        window.location.href = "/login.html";
      }, 800);
    } else {
      resetMessage.textContent = result.message;
      resetMessage.classList.add("is-error");
    }
  } catch (error) {
    resetMessage.textContent = error.message || "Không thể đặt lại mật khẩu.";
    resetMessage.classList.add("is-error");
  } finally {
    submitBtn.disabled = false;
  }
});

// Change email button
changeEmailBtn?.addEventListener("click", () => {
  switchToRequestStep();
});

// Resend code button
resendCodeBtn?.addEventListener("click", async () => {
  if (!currentResetEmail) return;
  resendCodeBtn.disabled = true;
  resetMessage.textContent = "Đang gửi lại mã xác thực mới...";
  resetMessage.classList.remove("is-error");

  try {
    const result = await requestPasswordReset(currentResetEmail);
    if (result.ok) {
      resetMessage.textContent = "Đã gửi mã xác thực mới!";
      resetMessage.classList.remove("is-error");
      if (result.resetCode) {
        demoHintBox.style.display = "flex";
        demoCodeDisplay.textContent = result.resetCode;
        autoFillCodeBtn.onclick = () => {
          resetCodeInput.value = result.resetCode;
          resetCodeInput.focus();
        };
      }
    } else {
      resetMessage.textContent = result.message;
      resetMessage.classList.add("is-error");
    }
  } catch (error) {
    resetMessage.textContent = error.message || "Không thể gửi lại mã.";
    resetMessage.classList.add("is-error");
  } finally {
    resendCodeBtn.disabled = false;
  }
});

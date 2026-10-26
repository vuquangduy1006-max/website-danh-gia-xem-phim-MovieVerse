/**
 * MovieVerse Password Visibility Toggle Utility
 * Provides accessible, responsive show/hide functionality for password input fields.
 */

const EYE_SHOW_SVG = `
  <svg class="password-icon eye-show" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
`;

const EYE_HIDE_SVG = `
  <svg class="password-icon eye-hide" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display: none;">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
    <line x1="2" x2="22" y1="2" y2="22"></line>
  </svg>
`;

/**
 * Creates a toggle button element for a password input.
 * @param {HTMLInputElement} input
 * @param {string} customLabel
 * @returns {HTMLButtonElement}
 */
export function createPasswordToggleButton(input, customLabel = "mật khẩu") {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "auth-password-toggle";
  button.dataset.label = customLabel;
  button.setAttribute("aria-label", `Hiện ${customLabel}`);
  button.setAttribute("title", `Hiện ${customLabel}`);
  button.setAttribute("aria-pressed", "false");
  if (input.id) {
    button.setAttribute("aria-controls", input.id);
  }
  button.innerHTML = `${EYE_SHOW_SVG}${EYE_HIDE_SVG}`;
  return button;
}

/**
 * Initializes show/hide behavior on a password input wrapper.
 * @param {HTMLElement} wrapper
 */
function bindToggle(wrapper) {
  const input = wrapper.querySelector("input");
  let toggleBtn = wrapper.querySelector(".auth-password-toggle");

  if (!input) return;

  if (!toggleBtn) {
    const labelText = wrapper.closest(".auth-field")?.querySelector("label")?.textContent?.trim().toLowerCase() || "mật khẩu";
    toggleBtn = createPasswordToggleButton(input, labelText);
    wrapper.appendChild(toggleBtn);
  }

  if (toggleBtn.dataset.bound === "true") return;
  toggleBtn.dataset.bound = "true";

  const targetLabel = toggleBtn.dataset.label || "mật khẩu";

  toggleBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const willShow = input.type === "password";
    input.type = willShow ? "text" : "password";

    toggleBtn.setAttribute("aria-pressed", willShow ? "true" : "false");
    const newText = willShow ? `Ẩn ${targetLabel}` : `Hiện ${targetLabel}`;
    toggleBtn.setAttribute("aria-label", newText);
    toggleBtn.setAttribute("title", newText);

    const eyeShow = toggleBtn.querySelector(".eye-show");
    const eyeHide = toggleBtn.querySelector(".eye-hide");
    if (eyeShow && eyeHide) {
      eyeShow.style.display = willShow ? "none" : "block";
      eyeHide.style.display = willShow ? "block" : "none";
    }

    wrapper.classList.toggle("is-revealed", willShow);
    toggleBtn.classList.toggle("is-active", willShow);

    // Keep input focus and place cursor at end
    input.focus();
    if (typeof input.setSelectionRange === "function") {
      const len = input.value.length;
      input.setSelectionRange(len, len);
    }
  });
}

/**
 * Scans the provided container and binds password toggles to all wrappers or password inputs.
 * @param {HTMLElement|Document} root
 */
export function setupPasswordToggle(root = document) {
  // 1. Process explicit wrappers
  const wrappers = root.querySelectorAll(".auth-password-wrapper");
  wrappers.forEach(bindToggle);

  // 2. Auto-wrap any unwrapped password input in .auth-field
  const standalonePasswordInputs = root.querySelectorAll(".auth-field input[type='password']");
  standalonePasswordInputs.forEach((input) => {
    if (input.closest(".auth-password-wrapper")) return;

    const wrapper = document.createElement("div");
    wrapper.className = "auth-password-wrapper";
    input.parentNode.insertBefore(wrapper, input);
    wrapper.appendChild(input);
    bindToggle(wrapper);
  });
}

/**
 * Resets all revealed password inputs back to concealed (type="password").
 * @param {HTMLElement|Document} root
 */
export function resetPasswordVisibility(root = document) {
  const wrappers = root.querySelectorAll(".auth-password-wrapper");
  wrappers.forEach((wrapper) => {
    const input = wrapper.querySelector("input");
    const toggleBtn = wrapper.querySelector(".auth-password-toggle");
    if (input && input.type === "text") {
      input.type = "password";
    }
    if (toggleBtn) {
      toggleBtn.setAttribute("aria-pressed", "false");
      const targetLabel = toggleBtn.dataset.label || "mật khẩu";
      const resetText = `Hiện ${targetLabel}`;
      toggleBtn.setAttribute("aria-label", resetText);
      toggleBtn.setAttribute("title", resetText);

      const eyeShow = toggleBtn.querySelector(".eye-show");
      const eyeHide = toggleBtn.querySelector(".eye-hide");
      if (eyeShow && eyeHide) {
        eyeShow.style.display = "block";
        eyeHide.style.display = "none";
      }
      toggleBtn.classList.remove("is-active");
    }
    wrapper.classList.remove("is-revealed");
  });
}

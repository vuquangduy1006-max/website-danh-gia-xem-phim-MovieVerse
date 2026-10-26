import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  createPasswordToggleButton,
  setupPasswordToggle,
  resetPasswordVisibility,
} from "../src/password-toggle.js";

const projectRoot = new URL("../", import.meta.url);

test("login.html contains password toggle markup with accessible attributes", async () => {
  const html = await readFile(new URL("login.html", projectRoot), "utf8");
  assert.match(html, /class="auth-password-wrapper"/);
  assert.match(html, /id="loginPassword"/);
  assert.match(html, /class="auth-password-toggle"/);
  assert.match(html, /aria-label="Hiện mật khẩu"/);
  assert.match(html, /aria-controls="loginPassword"/);
});

test("forgot-password.html contains password toggle markup for both password fields", async () => {
  const html = await readFile(
    new URL("forgot-password.html", projectRoot),
    "utf8",
  );
  assert.match(html, /id="resetNewPassword"/);
  assert.match(html, /id="resetConfirmPassword"/);
  assert.match(html, /aria-controls="resetNewPassword"/);
  assert.match(html, /aria-controls="resetConfirmPassword"/);
  assert.match(html, /aria-label="Hiện mật khẩu mới"/);
  assert.match(html, /aria-label="Hiện xác nhận mật khẩu mới"/);
});

test("register.html and account.html also contain password toggle wrappers", async () => {
  const [registerHtml, accountHtml] = await Promise.all([
    readFile(new URL("register.html", projectRoot), "utf8"),
    readFile(new URL("account.html", projectRoot), "utf8"),
  ]);
  assert.match(registerHtml, /id="registerPassword"/);
  assert.match(registerHtml, /aria-controls="registerPassword"/);

  assert.match(accountHtml, /id="currentPassword"/);
  assert.match(accountHtml, /id="newPassword"/);
  assert.match(accountHtml, /id="confirmPassword"/);
});

test("auth.css contains styling and edge-reveal suppression for password toggle", async () => {
  const css = await readFile(new URL("src/auth.css", projectRoot), "utf8");
  assert.match(css, /\.auth-password-wrapper/);
  assert.match(css, /\.auth-password-toggle/);
  assert.match(css, /::-ms-reveal/);
  assert.match(css, /::-ms-clear/);
});

test("password toggle simulates show and hide cycles accurately", () => {
  // Mock minimal DOM elements for Node.js test environment
  class MockElement {
    constructor(tagName) {
      this.tagName = tagName.toUpperCase();
      this.attributes = {};
      const tokens = new Set();
      this.classList = {
        add: (t) => tokens.add(t),
        remove: (t) => tokens.delete(t),
        contains: (t) => tokens.has(t),
        toggle: (t, force) => {
          if (force === true) {
            tokens.add(t);
            return true;
          }
          if (force === false) {
            tokens.delete(t);
            return false;
          }
          if (tokens.has(t)) {
            tokens.delete(t);
            return false;
          }
          tokens.add(t);
          return true;
        },
      };
      this.children = [];
      this.style = {};
      this.dataset = {};
      this.listeners = {};
      this.parentNode = null;
    }
    setAttribute(name, value) {
      this.attributes[name] = String(value);
      if (name === "type") this.type = String(value);
    }
    getAttribute(name) {
      return this.attributes[name] ?? null;
    }
    addEventListener(event, handler) {
      this.listeners[event] = handler;
    }
    dispatchEvent(event) {
      if (this.listeners[event.type]) {
        this.listeners[event.type](event);
      }
    }
    appendChild(child) {
      child.parentNode = this;
      this.children.push(child);
      return child;
    }
    querySelector(selector) {
      if (selector === "input") {
        return this.children.find((c) => c.tagName === "INPUT") || null;
      }
      if (selector === ".auth-password-toggle") {
        return (
          this.children.find((c) => c.classList.contains("auth-password-toggle")) ||
          null
        );
      }
      if (selector === ".eye-show") {
        return (
          this.children.find((c) => c.classList.contains("eye-show")) ||
          (this.tagName === "BUTTON"
            ? this.children.find((c) => c.classList.contains("eye-show"))
            : null)
        );
      }
      if (selector === ".eye-hide") {
        return (
          this.children.find((c) => c.classList.contains("eye-hide")) ||
          (this.tagName === "BUTTON"
            ? this.children.find((c) => c.classList.contains("eye-hide"))
            : null)
        );
      }
      return null;
    }
    querySelectorAll(selector) {
      if (selector === ".auth-password-wrapper") {
        return this.classList.contains("auth-password-wrapper") ? [this] : [];
      }
      if (selector === ".auth-field input[type='password']") {
        return [];
      }
      return [];
    }
    closest() {
      return null;
    }
    focus() {}
  }

  // Create input and wrapper
  const wrapper = new MockElement("div");
  wrapper.classList.add("auth-password-wrapper");

  const input = new MockElement("input");
  input.type = "password";
  input.value = "SecretPassword123";
  wrapper.appendChild(input);

  const toggleBtn = new MockElement("button");
  toggleBtn.classList.add("auth-password-toggle");
  toggleBtn.dataset.label = "mật khẩu";
  toggleBtn.setAttribute("aria-pressed", "false");

  const eyeShow = new MockElement("svg");
  eyeShow.classList.add("eye-show");
  const eyeHide = new MockElement("svg");
  eyeHide.classList.add("eye-hide");
  eyeHide.style.display = "none";
  toggleBtn.appendChild(eyeShow);
  toggleBtn.appendChild(eyeHide);
  wrapper.appendChild(toggleBtn);

  setupPasswordToggle(wrapper);

  // Click 1: Should show password
  toggleBtn.dispatchEvent({ type: "click", preventDefault: () => {} });
  assert.equal(input.type, "text");
  assert.equal(toggleBtn.getAttribute("aria-pressed"), "true");
  assert.equal(toggleBtn.getAttribute("aria-label"), "Ẩn mật khẩu");
  assert.equal(eyeShow.style.display, "none");
  assert.equal(eyeHide.style.display, "block");

  // Click 2: Should hide password
  toggleBtn.dispatchEvent({ type: "click", preventDefault: () => {} });
  assert.equal(input.type, "password");
  assert.equal(toggleBtn.getAttribute("aria-pressed"), "false");
  assert.equal(toggleBtn.getAttribute("aria-label"), "Hiện mật khẩu");
  assert.equal(eyeShow.style.display, "block");
  assert.equal(eyeHide.style.display, "none");

  // Show again then test resetPasswordVisibility
  toggleBtn.dispatchEvent({ type: "click", preventDefault: () => {} });
  assert.equal(input.type, "text");
  resetPasswordVisibility(wrapper);
  assert.equal(input.type, "password");
  assert.equal(toggleBtn.getAttribute("aria-pressed"), "false");
});

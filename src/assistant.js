import "./assistant.css";
import { getMovieGenres } from "./data/data.js";

export function initMovieAssistant(movies) {
  const root = document.createElement("div");
  root.className = "assistant-root";
  root.innerHTML = `
    <button class="assistant-launcher" id="assistantLauncher" type="button" aria-label="Mở trợ lý MovieVerse" aria-expanded="false" aria-controls="assistantPanel">
      <span aria-hidden="true">✦</span>
    </button>
    <section class="assistant-panel" id="assistantPanel" aria-label="Trợ lý AI MovieVerse" hidden>
      <header class="assistant-header">
        <div class="assistant-identity">
          <span class="assistant-mark" aria-hidden="true">M</span>
          <div><strong>MovieVerse AI</strong><small>Tư vấn phim cho bạn</small></div>
        </div>
        <button class="assistant-close" id="assistantClose" type="button" aria-label="Đóng trợ lý">×</button>
      </header>
      <div class="assistant-messages" id="assistantMessages" aria-live="polite" aria-relevant="additions text">
        <div class="assistant-message assistant-message-bot">Chào bạn, tối nay mình giúp bạn tìm phim nhé. Bạn thích thể loại hoặc tâm trạng nào?</div>
      </div>
      <div class="assistant-prompts" aria-label="Gợi ý câu hỏi">
        <button type="button" data-prompt="Gợi ý cho mình một phim phù hợp để xem tối nay.">Tìm phim tối nay</button>
        <button type="button" data-prompt="Có phim nào vui và phù hợp xem cùng gia đình không?">Xem cùng gia đình</button>
        <button type="button" data-prompt="Tư vấn một phim khoa học viễn tưởng hay trong kho phim.">Khoa học viễn tưởng</button>
      </div>
      <form class="assistant-composer" id="assistantForm">
        <label class="sr-only" for="assistantInput">Tin nhắn cho trợ lý</label>
        <textarea id="assistantInput" rows="1" maxlength="1000" placeholder="Hỏi về phim bạn muốn xem..."></textarea>
        <button id="assistantSend" type="submit" aria-label="Gửi tin nhắn"><span aria-hidden="true">↑</span></button>
      </form>
      <p class="assistant-privacy">Câu hỏi và danh mục phim được gửi đến AI để trả lời.</p>
    </section>
  `;
  document.body.append(root);

  const launcher = root.querySelector("#assistantLauncher");
  const panel = root.querySelector("#assistantPanel");
  const closeButton = root.querySelector("#assistantClose");
  const form = root.querySelector("#assistantForm");
  const input = root.querySelector("#assistantInput");
  const sendButton = root.querySelector("#assistantSend");
  const messageList = root.querySelector("#assistantMessages");
  const conversation = [];
  let isSending = false;

  const setOpen = (isOpen) => {
    panel.hidden = !isOpen;
    launcher.setAttribute("aria-expanded", String(isOpen));
    if (isOpen) input.focus();
    else launcher.focus();
  };

  const appendMessage = (role, text, isPending = false) => {
    const message = document.createElement("div");
    message.className = `assistant-message ${role === "user" ? "assistant-message-user" : "assistant-message-bot"}${isPending ? " assistant-message-pending" : ""}`;
    message.textContent = text;
    messageList.append(message);
    while (messageList.children.length > 18) {
      messageList.firstElementChild.remove();
    }
    messageList.scrollTop = messageList.scrollHeight;
    return message;
  };

  const sendMessage = async (rawText) => {
    const content = rawText.trim();
    if (!content || isSending) return;

    conversation.push({ role: "user", content });
    appendMessage("user", content);
    input.value = "";
    input.style.height = "auto";
    isSending = true;
    input.disabled = true;
    sendButton.disabled = true;
    const pendingMessage = appendMessage(
      "assistant",
      "Đang tìm câu trả lời phù hợp...",
      true,
    );

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: conversation.slice(-8),
          movies: movies.map((movie) => ({
            id: movie.id,
            title: movie.title,
            year: movie.year,
            genre: getMovieGenres(movie).join(", "),
            rating: movie.rating,
            description: movie.description,
          })),
        }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Trợ lý chưa thể trả lời.");
      pendingMessage.textContent = result.answer;
      pendingMessage.classList.remove("assistant-message-pending");
      conversation.push({ role: "assistant", content: result.answer });
    } catch (error) {
      pendingMessage.textContent = error.message.includes("Failed to fetch")
        ? "Chưa kết nối được máy chủ trợ lý. Hãy kiểm tra máy chủ API đang chạy."
        : error.message;
      pendingMessage.classList.add("assistant-message-error");
      pendingMessage.classList.remove("assistant-message-pending");
    } finally {
      isSending = false;
      input.disabled = false;
      sendButton.disabled = false;
      input.focus();
      messageList.scrollTop = messageList.scrollHeight;
    }
  };

  launcher.addEventListener("click", () => setOpen(panel.hidden));
  closeButton.addEventListener("click", () => setOpen(false));
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    sendMessage(input.value);
  });
  input.addEventListener("input", () => {
    input.style.height = "auto";
    input.style.height = `${Math.min(input.scrollHeight, 112)}px`;
  });
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      form.requestSubmit();
    }
  });
  root.querySelectorAll("[data-prompt]").forEach((button) => {
    button.addEventListener("click", () => sendMessage(button.dataset.prompt));
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !panel.hidden) setOpen(false);
  });
}

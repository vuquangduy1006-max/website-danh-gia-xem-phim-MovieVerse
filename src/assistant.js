import "./assistant.css";
import { getMovieGenres } from "./data/data.js";

export function initMovieAssistant(movieSource) {
  const getMovies = () =>
    typeof movieSource === "function" ? movieSource() : movieSource;
  const root = document.createElement("div");
  root.className = "assistant-root";
  root.innerHTML = `
    <button class="assistant-launcher" id="assistantLauncher" type="button" aria-label="Mở Trợ lý AI MovieVerse" aria-expanded="false" aria-controls="assistantPanel">
      <span aria-hidden="true">🤖</span><span>Trợ lý AI</span>
    </button>
    <section class="assistant-panel" id="assistantPanel" aria-label="Trợ lý AI MovieVerse" hidden>
      <header class="assistant-header">
        <div class="assistant-identity">
          <span class="assistant-mark" aria-hidden="true">M</span>
          <div><strong>Trợ lý AI MovieVerse</strong><small>Gợi ý phim hợp tâm trạng của bạn</small></div>
        </div>
        <button class="assistant-close" id="assistantClose" type="button" aria-label="Đóng trợ lý">×</button>
      </header>
      <div class="assistant-messages" id="assistantMessages" aria-live="polite" aria-relevant="additions text">
        <div class="assistant-message assistant-message-bot">Chào bạn, tối nay mình giúp bạn tìm phim nhé. Bạn thích thể loại hoặc tâm trạng nào?</div>
      </div>
      <div class="assistant-prompts" aria-label="Gợi ý câu hỏi">
        <button type="button" data-prompt="Tối nay tôi muốn xem phim khoảng 2 tiếng, thể loại hành động.">Hành động ~2 tiếng</button>
        <button type="button" data-prompt="Hôm nay mình hơi buồn, gợi ý phim gì nhẹ nhàng và ấm áp giúp mình nhé.">Cần phim an ủi</button>
        <button type="button" data-prompt="Mình muốn xem gì đó hồi hộp, gay cấn và khó đoán.">Muốn hồi hộp</button>
        <button type="button" data-prompt="Có phim nào vui và phù hợp xem cùng gia đình không?">Xem cùng gia đình</button>
        <button type="button" data-prompt="Tư vấn một phim khoa học viễn tưởng hay trong kho phim.">Khoa học viễn tưởng</button>
      </div>
      <form class="assistant-composer" id="assistantForm">
        <label class="sr-only" for="assistantInput">Tin nhắn cho trợ lý</label>
        <textarea id="assistantInput" rows="1" maxlength="1000" placeholder="Hỏi về phim bạn muốn xem..."></textarea>
        <button id="assistantSend" type="submit" aria-label="Gửi tin nhắn"><span aria-hidden="true">↑</span></button>
      </form>
      <p class="assistant-privacy">Gợi ý dựa trên thể loại, thời lượng và danh mục phim MovieVerse.</p>
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

  const renderAnswer = (element, text) => {
    const moviesByTitle = new Map(
      getMovies()
        .filter((movie) => movie.id && movie.title)
        .map((movie) => [movie.title.toLocaleLowerCase("vi"), movie]),
    );
    const titles = [...moviesByTitle.keys()].sort(
      (first, second) => second.length - first.length,
    );
    if (!titles.length) {
      element.textContent = text;
      return;
    }

    element.replaceChildren();
    const titlePattern = new RegExp(
      `(^|[^\\p{L}\\p{N}])(${titles.map((title) => title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})(?=$|[^\\p{L}\\p{N}])`,
      "giu",
    );
    let cursor = 0;
    let match;
    while ((match = titlePattern.exec(text))) {
      const linkStart = match.index + match[1].length;
      element.append(document.createTextNode(text.slice(cursor, linkStart)));

      const movie = moviesByTitle.get(match[2].toLocaleLowerCase("vi"));
      const link = document.createElement("a");
      link.className = "assistant-movie-link";
      link.href = `/movie-detail.html?id=${encodeURIComponent(movie.id)}`;
      link.textContent = match[2];
      element.append(link);
      cursor = linkStart + match[2].length;
    }
    element.append(document.createTextNode(text.slice(cursor)));
  };

  const sendMessage = async (rawText) => {
    const content = rawText.trim();
    if (!content || isSending) return;

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
          messages: [...conversation.slice(-6), { role: "user", content }],
          movies: getMovies().map((movie) => ({
            id: movie.id,
            title: movie.title,
            year: movie.year,
            genre: getMovieGenres(movie).join(", "),
            rating: movie.rating,
            description: movie.description,
          })),
        }),
      });
      let result;
      if (
        !response.headers
          .get("content-type")
          ?.toLocaleLowerCase("en")
          .includes("application/json")
      ) {
        throw new Error(
          "Máy chủ website đang trả về trang HTML thay vì API chat. Nếu chạy trên máy cá nhân, hãy khởi động backend bằng npm run dev:api; nếu dùng bản online, cần cấu hình máy chủ/reverse proxy cho đường dẫn /api.",
        );
      }
      try {
        result = await response.json();
      } catch {
        throw new Error(
          `API chat trả về JSON không hợp lệ (HTTP ${response.status}). Hãy kiểm tra máy chủ API.`,
        );
      }
      if (!response.ok)
        throw new Error(result?.error || "Trợ lý chưa thể trả lời.");
      if (typeof result?.answer !== "string" || !result.answer.trim()) {
        throw new Error("Máy chủ trợ lý chưa trả về câu trả lời hợp lệ.");
      }
      renderAnswer(pendingMessage, result.answer);
      if (typeof result.notice === "string" && result.notice) {
        const notice = document.createElement("span");
        notice.className = "assistant-message-notice";
        notice.textContent = result.notice;
        pendingMessage.append(notice);
      }
      pendingMessage.classList.remove("assistant-message-pending");
      conversation.push({ role: "user", content });
      conversation.push({ role: "assistant", content: result.answer });
      if (conversation.length > 8) conversation.splice(0, conversation.length - 8);
    } catch (error) {
      pendingMessage.textContent =
        error instanceof TypeError && error.message.includes("fetch")
          ? "Chưa kết nối được máy chủ trợ lý. Hãy kiểm tra máy chủ API đang chạy."
          : error instanceof Error
            ? error.message
            : "Đã xảy ra lỗi khi gửi câu hỏi. Vui lòng thử lại.";
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

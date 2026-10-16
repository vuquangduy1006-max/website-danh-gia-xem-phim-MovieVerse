import "./assistant-chat.css";
import {
  answerFromCatalog,
  findMovieNamedInQuestion,
} from "../assistant-recommendations.js";
import { getMovieGenres } from "./data/data.js";
import { rankMovieRecommendations } from "./data/recommendations.js";

const WELCOME_MESSAGE =
  "Chào bạn! Tối nay bạn muốn xem phim theo thể loại, tâm trạng hay thời lượng nào?";

export function mountAssistantChat(movies) {
  const messages = [];
  const compactCatalog = movies.slice(0, 60).map((movie) => ({
    id: movie.id,
    title: movie.title,
    year: movie.year,
    genre: getMovieGenres(movie).join(", "),
    rating: movie.rating,
    description: String(movie.description || "").slice(0, 220),
  }));

  document.body.insertAdjacentHTML(
    "beforeend",
    `<div class="assistant-chat" id="assistantChat">
      <button class="assistant-chat-launcher" id="assistantChatLauncher" type="button" aria-label="Mở tư vấn phim" aria-expanded="false" aria-controls="assistantChatPanel">
        <span class="assistant-chat-launcher-icon" aria-hidden="true">✦</span>
      </button>
      <section class="assistant-chat-panel" id="assistantChatPanel" aria-label="Tư vấn phim MovieVerse" aria-hidden="true" hidden>
        <header class="assistant-chat-header">
          <div class="assistant-chat-avatar" aria-hidden="true">M</div>
          <div class="assistant-chat-heading">
            <strong>MovieVerse Match</strong>
            <span><i aria-hidden="true"></i> Sẵn sàng tìm phim cùng bạn</span>
          </div>
          <button class="assistant-chat-reset" id="assistantChatReset" type="button" title="Cuộc trò chuyện mới" aria-label="Bắt đầu cuộc trò chuyện mới">↻</button>
          <button class="assistant-chat-close" id="assistantChatClose" type="button" title="Đóng chat" aria-label="Đóng cửa sổ tư vấn">×</button>
        </header>
        <div class="assistant-chat-messages" id="assistantChatMessages" role="log" aria-live="polite" aria-relevant="additions text"></div>
        <div class="assistant-chat-suggestions" id="assistantChatSuggestions" aria-label="Gợi ý câu hỏi">
          <button type="button">Phim hài nhẹ nhàng</button>
          <button type="button">Phim hành động cuốn hút</button>
          <button type="button">Mình cần được an ủi</button>
        </div>
        <form class="assistant-chat-form" id="assistantChatForm">
          <label class="sr-only" for="assistantChatInput">Bạn muốn xem phim như thế nào?</label>
          <textarea id="assistantChatInput" rows="1" maxlength="500" placeholder="Chia sẻ gu phim hoặc tâm trạng..." required></textarea>
          <button type="submit" aria-label="Gửi tin nhắn" title="Gửi tin nhắn"><span aria-hidden="true">↑</span></button>
        </form>
        <p class="assistant-chat-footnote">Gợi ý dựa trên kho phim MovieVerse</p>
      </section>
    </div>`,
  );

  const launcher = document.querySelector("#assistantChatLauncher");
  const panel = document.querySelector("#assistantChatPanel");
  const messageList = document.querySelector("#assistantChatMessages");
  const form = document.querySelector("#assistantChatForm");
  const input = document.querySelector("#assistantChatInput");
  const suggestions = document.querySelector("#assistantChatSuggestions");

  function setOpen(open) {
    panel.hidden = !open;
    panel.setAttribute("aria-hidden", String(!open));
    launcher.setAttribute("aria-expanded", String(open));
    launcher.classList.toggle("is-open", open);
    if (open) input.focus();
  }

  function addMessage(role, content, { notice = "", pending = false } = {}) {
    const message = document.createElement("article");
    message.className = `assistant-message assistant-message-${role}${pending ? " is-pending" : ""}`;
    if (pending) {
      message.setAttribute("aria-label", "Đang tìm phim phù hợp");
      message.innerHTML = '<span></span><span></span><span></span>';
    } else {
      const text = document.createElement("p");
      text.textContent = content;
      message.append(text);

      if (role === "assistant") {
        const userQuery = messages.at(-2)?.content || "";
        const firstMentionedMovie =
          findMovieNamedInQuestion(userQuery, movies) ||
          findMovieNamedInQuestion(content, movies);

        if (firstMentionedMovie) {
          message.classList.add("has-recommendations");
          const cards = document.createElement("div");
          cards.className = "assistant-chat-recommendations";
          const createMovieCard = (movie, { primary = false, reason = "" } = {}) => {
            const link = document.createElement("a");
            link.className = `assistant-chat-recommendation${primary ? " is-primary" : " is-extra"}`;
            link.href = `/movie-detail.html?id=${encodeURIComponent(movie.id)}`;

            const poster = document.createElement("img");
            poster.src = movie.poster || movie.backdrop || "";
            poster.alt = `Poster phim ${movie.title}`;
            poster.loading = "lazy";
            poster.addEventListener("error", () => {
              if (movie.backdrop && poster.src !== movie.backdrop) {
                poster.src = movie.backdrop;
              } else {
                poster.removeAttribute("src");
                poster.classList.add("is-unavailable");
              }
            });

            const title = document.createElement("strong");
            title.textContent = movie.title;
            const detail = document.createElement("span");
            detail.textContent = reason
              ? `${movie.year} · ${reason}`
              : `${movie.year} · ${getMovieGenres(movie).join(", ")}`;
            const summary = document.createElement("p");
            summary.className = "assistant-chat-recommendation-summary";
            const description = String(movie.description || "").trim();
            const maxDescriptionLength = primary ? 160 : 100;
            summary.textContent = description.length > maxDescriptionLength
              ? `${description.slice(0, maxDescriptionLength - 3).trimEnd()}...`
              : description;
            link.append(poster, title, detail, summary);
            return link;
          };

          cards.append(createMovieCard(firstMentionedMovie, { primary: true }));
          message.insertBefore(cards, text);

          const extraRecommendations = rankMovieRecommendations({
            movies,
            query: userQuery,
            limit: 4,
            excludeMovieIds: [firstMentionedMovie.id],
          });
          if (extraRecommendations.length) {
            const extraSection = document.createElement("div");
            extraSection.className = "assistant-chat-extra-section";
            const heading = document.createElement("p");
            heading.className = "assistant-chat-recommendations-heading";
            heading.textContent = "Gợi ý thêm";
            extraSection.append(heading);
            const extras = document.createElement("div");
            extras.className = "assistant-chat-more-recommendations";
            extraRecommendations.forEach(({ movie, reasons }) => {
              extras.append(createMovieCard(movie, { reason: reasons[0] }));
            });
            extraSection.append(extras);
            message.append(extraSection);
          }
        }
      }
    }
    if (notice) {
      const note = document.createElement("small");
      note.className = "assistant-chat-notice";
      note.textContent = notice;
      message.append(note);
    }
    messageList.append(message);
    messageList.scrollTop = messageList.scrollHeight;
    return message;
  }

  function resetConversation() {
    messages.length = 0;
    messageList.replaceChildren();
    suggestions.hidden = false;
    addMessage("assistant", WELCOME_MESSAGE);
  }

  async function sendMessage(rawMessage) {
    const content = rawMessage.trim();
    if (!content || form.dataset.sending === "true") return;

    suggestions.hidden = true;
    messages.push({ role: "user", content });
    addMessage("user", content);
    input.value = "";
    input.disabled = true;
    form.dataset.sending = "true";
    form.querySelector("button").disabled = true;
    const pendingMessage = addMessage("assistant", "", { pending: true });

    try {
      let answer;
      let notice = "";
      try {
        const response = await fetch("/api/assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages, movies: compactCatalog }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Không thể gửi câu hỏi.");
        answer = result.answer;
        notice = result.notice || "";
      } catch (error) {
        answer = answerFromCatalog(content, compactCatalog);
        notice = "Đang dùng gợi ý từ kho phim nội bộ.";
        if (!answer) throw error;
      }

      pendingMessage.remove();
      messages.push({ role: "assistant", content: answer });
      addMessage("assistant", answer, { notice });
    } catch {
      pendingMessage.remove();
      addMessage("assistant", "Mình chưa gửi được câu trả lời. Bạn thử lại sau nhé.");
      suggestions.hidden = false;
    } finally {
      input.disabled = false;
      form.dataset.sending = "false";
      form.querySelector("button").disabled = false;
      input.focus();
    }
  }

  launcher.addEventListener("click", () => setOpen(panel.hidden));
  document.querySelector("#assistantChatClose").addEventListener("click", () => setOpen(false));
  document.querySelector("#assistantChatReset").addEventListener("click", resetConversation);
  suggestions.addEventListener("wheel", (event) => {
    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY)
      ? event.deltaX
      : event.deltaY;
    if (!delta || suggestions.scrollWidth <= suggestions.clientWidth) return;
    event.preventDefault();
    suggestions.scrollLeft += delta;
  }, { passive: false });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    sendMessage(input.value);
  });
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      form.requestSubmit();
    }
  });
  suggestions.addEventListener("click", (event) => {
    const suggestion = event.target.closest("button");
    if (suggestion) sendMessage(suggestion.textContent);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !panel.hidden) setOpen(false);
  });

  resetConversation();
}

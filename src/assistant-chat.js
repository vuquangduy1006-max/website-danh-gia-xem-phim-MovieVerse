import "./assistant-chat.css";
import {
  answerFromCatalog,
  findMovieNamedInQuestion,
  getRequestedMinimumRating,
  getRequestedPersonalSections,
  isUnrecognizedMovieRequest,
} from "../assistant-recommendations.js";
import { getMovieGenres, getReleaseSchedule } from "./data/data.js";
import { loadFavorites } from "./data/favorites.js";
import { loadWatchHistory } from "./data/history.js";
import { loadReviews } from "./data/reviews.js";
import { getMovieRanking } from "./data/rankings.js";
import {
  getRequestedGenres,
  rankMovieRecommendations,
} from "./data/recommendations.js";

const WELCOME_MESSAGE =
  "Chào bạn! ✨ Mình là MovieVerse AI. Bạn thích phim hành động, tình cảm hay muốn chọn phim theo tâm trạng hôm nay?";
const MOVIE_NOT_FOUND_MESSAGE = "Không thể tìm ra phim này.";

function getPersonalListData(section, movies) {
  const movieById = new Map(movies.map((movie) => [movie.id, movie]));
  if (section === "history") {
    const items = loadWatchHistory()
      .map((entry) => {
        const movie = movieById.get(entry.id);
        if (!movie) return null;
        const watchedAt = new Date(entry.viewedAt);
        return {
          movie,
          href: `/movie-detail.html?id=${encodeURIComponent(movie.id)}`,
          reason: `Xem lần cuối ${Number.isNaN(watchedAt.getTime()) ? "gần đây" : watchedAt.toLocaleDateString("vi-VN")}`,
        };
      })
      .filter(Boolean);
    return {
      title: "Lịch sử xem",
      href: "/history.html",
      emptyMessage: "Bạn chưa có phim nào trong lịch sử xem.",
      items,
    };
  }

  if (section === "favorites") {
    const items = loadFavorites()
      .map((id) => movieById.get(id))
      .filter(Boolean)
      .map((movie) => ({
        movie,
        href: `/movie-detail.html?id=${encodeURIComponent(movie.id)}`,
        reason: "Phim yêu thích",
      }));
    return {
      title: "Phim yêu thích",
      href: "/favorites.html",
      emptyMessage: "Bạn chưa lưu phim yêu thích nào.",
      items,
    };
  }

  if (section === "ranking") {
    const items = getMovieRanking(movies, loadReviews(), "all").map(
      ({ movie, score, reviewCount }, index) => ({
        movie,
        href: `/movie-detail.html?id=${encodeURIComponent(movie.id)}`,
        reason: `#${index + 1} · ★ ${score.toFixed(1)}/10 · ${reviewCount} review`,
      }),
    );
    return {
      title: "Top phim",
      href: "/ranking.html",
      emptyMessage: "Chưa có phim nào trong bảng xếp hạng.",
      items,
    };
  }

  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const items = getReleaseSchedule()
    .filter((event) => event.date >= todayKey && movieById.has(event.movieId))
    .sort((first, second) =>
      `${first.date} ${first.time || ""}`.localeCompare(
        `${second.date} ${second.time || ""}`,
      ),
    )
    .map((event) => {
      const movie = movieById.get(event.movieId);
      const date = new Date(`${event.date}T00:00:00`);
      const dateLabel = Number.isNaN(date.getTime())
        ? event.date
        : date.toLocaleDateString("vi-VN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          });
      const eventLabel = event.type === "episode"
        ? `Tập ${String(event.episodeNumber).padStart(2, "0")}`
        : "Phim mới";
      return {
        movie,
        href: `/movie-detail.html?id=${encodeURIComponent(movie.id)}`,
        reason: `${eventLabel} · ${dateLabel}${event.time ? ` · ${event.time}` : ""}`,
      };
    });
  return {
    title: "Lịch phát hành sắp tới",
    href: "/schedule.html",
    emptyMessage: "Hiện chưa có sự kiện phát hành sắp tới.",
    items,
  };
}

function summarizePersonalLists(lists) {
  return lists
    .map((list) =>
      list.items.length
        ? `${list.title}: ${list.items.length} mục. ${list.items.slice(0, 4).map(({ movie }) => movie.title).join(", ")}.`
        : list.emptyMessage,
    )
    .join(" ");
}

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
      <button class="assistant-chat-launcher" id="assistantChatLauncher" type="button" aria-label="Mở MovieVerse AI" aria-expanded="false" aria-controls="assistantChatPanel">
        <span class="assistant-chat-launcher-icon" aria-hidden="true">✦</span><span class="assistant-chat-launcher-label">Hỏi AI</span>
      </button>
      <section class="assistant-chat-panel" id="assistantChatPanel" aria-label="Tư vấn phim MovieVerse" aria-hidden="true" hidden>
        <header class="assistant-chat-header">
          <div class="assistant-chat-avatar" aria-hidden="true">✦</div>
          <div class="assistant-chat-heading">
            <strong>MovieVerse <span class="assistant-chat-ai-label">AI</span></strong>
            <span><i aria-hidden="true"></i> Trợ lý chọn phim của bạn</span>
          </div>
          <div class="assistant-chat-actions">
            <button class="assistant-chat-reset" id="assistantChatReset" type="button" title="Cuộc trò chuyện mới" aria-label="Bắt đầu cuộc trò chuyện mới">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
            </button>
            <button class="assistant-chat-close" id="assistantChatClose" type="button" title="Đóng chat" aria-label="Đóng cửa sổ tư vấn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </header>
        <div class="assistant-chat-messages" id="assistantChatMessages" role="log" aria-live="polite" aria-relevant="additions text"></div>
        <div class="assistant-chat-suggestions" id="assistantChatSuggestions" aria-label="Gợi ý câu hỏi">
          <button type="button">🍿 Phim hài nhẹ nhàng</button>
          <button type="button">🔥 Phim hành động cuốn hút</button>
          <button type="button">💜 Mình cần được an ủi</button>
        </div>
        <form class="assistant-chat-form" id="assistantChatForm">
          <label class="sr-only" for="assistantChatInput">Bạn muốn xem phim như thế nào?</label>
          <textarea id="assistantChatInput" rows="1" maxlength="500" placeholder="Bạn muốn xem phim gì hôm nay?" required></textarea>
          <button type="submit" aria-label="Gửi tin nhắn" title="Gửi tin nhắn"><span aria-hidden="true">↑</span></button>
        </form>
        <p class="assistant-chat-footnote">✦ Gợi ý dựa trên thư viện phim MovieVerse</p>
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

  function addMessage(
    role,
    content,
    { notice = "", pending = false, personalLists = [] } = {},
  ) {
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
        const requestedMovie = findMovieNamedInQuestion(userQuery, movies);
        const firstMentionedMovie = requestedMovie ||
          findMovieNamedInQuestion(content, movies);
        const requestedGenres = getRequestedGenres(userQuery, movies);
        const requestedRating = getRequestedMinimumRating(userQuery);
        const wantsFilteredList =
          requestedGenres.length > 0 || requestedRating !== null;

        if (personalLists.length || firstMentionedMovie || wantsFilteredList) {
          message.classList.add("has-recommendations");
          const cards = document.createElement("div");
          cards.className = "assistant-chat-recommendations";
          const createMovieCard = (movie, { primary = false, reason = "", searched = false, href = "" } = {}) => {
            const link = document.createElement("a");
            link.className = `assistant-chat-recommendation${primary ? " is-primary" : " is-extra"}`;
            link.href = href || `/movie-detail.html?id=${encodeURIComponent(movie.id)}`;

            const poster = document.createElement("img");
            poster.alt = `Poster phim ${movie.title}`;
            poster.loading = "eager";
            poster.decoding = "async";
            const posterSources = [movie.poster, movie.backdrop].filter(Boolean);
            const posterPlaceholder = document.createElement("span");
            posterPlaceholder.className = "assistant-chat-poster-placeholder";
            posterPlaceholder.textContent = movie.title;
            poster.addEventListener("error", () => {
              if (posterSources.length) {
                poster.src = posterSources.shift();
              } else {
                poster.replaceWith(posterPlaceholder);
              }
            });

            const title = document.createElement("strong");
            title.textContent = movie.title;
            const detail = document.createElement("span");
            const movieDetails = [movie.year, getMovieGenres(movie).join(", ")]
              .filter(Boolean);
            if (!reason && Number.isFinite(Number(movie.rating))) {
              movieDetails.push(`IMDb ${Number(movie.rating).toFixed(1)}/10`);
            }
            detail.textContent = reason
              ? `${movie.year} · ${reason}`
              : `${searched ? "Kết quả tìm kiếm · " : ""}${movieDetails.join(" · ")}`;
            const summary = document.createElement("p");
            summary.className = "assistant-chat-recommendation-summary";
            const description = String(movie.description || "").trim();
            const maxDescriptionLength = primary ? 160 : 100;
            summary.textContent = description.length > maxDescriptionLength
              ? `${description.slice(0, maxDescriptionLength - 3).trimEnd()}...`
              : description;
            link.append(poster, title, detail, summary);
            if (posterSources.length) {
              poster.src = posterSources.shift();
            } else {
              poster.replaceWith(posterPlaceholder);
            }
            return link;
          };

          if (personalLists.length) {
            personalLists.forEach((list) => {
              const section = document.createElement("div");
              section.className = "assistant-chat-extra-section";
              const heading = document.createElement("p");
              heading.className = "assistant-chat-recommendations-heading";
              heading.textContent = list.title;
              section.append(heading);
              if (list.items.length) {
                const itemCards = document.createElement("div");
                itemCards.className = "assistant-chat-more-recommendations";
                list.items.slice(0, 4).forEach((item) => {
                  itemCards.append(
                    createMovieCard(item.movie, {
                      reason: item.reason,
                      href: item.href,
                    }),
                  );
                });
                section.append(itemCards);
                if (list.items.length > 4) {
                  const viewAll = document.createElement("a");
                  viewAll.className = "assistant-chat-list-link";
                  viewAll.href = list.href;
                  viewAll.textContent = `Xem toàn bộ ${list.title.toLocaleLowerCase("vi")} →`;
                  section.append(viewAll);
                }
              } else {
                const emptyMessage = document.createElement("p");
                emptyMessage.className = "assistant-chat-list-empty";
                emptyMessage.textContent = list.emptyMessage;
                section.append(emptyMessage);
              }
              cards.append(section);
            });
          } else if (wantsFilteredList) {
            const genreRecommendations = rankMovieRecommendations({
              movies,
              query: userQuery,
              limit: movies.length,
            })
              .filter(({ movie }) =>
                (!requestedGenres.length ||
                  getMovieGenres(movie).some((genre) =>
                    requestedGenres.includes(genre),
                  )) &&
                  (requestedRating === null ||
                    Number(movie.rating) >= requestedRating),
              )
              .slice(0, 4);
            const firstRecommendedMovie = genreRecommendations[0]?.movie;
            if (firstRecommendedMovie) {
              const firstMovieDetails = [
                getMovieGenres(firstRecommendedMovie).join(", "),
                firstRecommendedMovie.year,
                Number.isFinite(Number(firstRecommendedMovie.rating))
                  ? `IMDb ${Number(firstRecommendedMovie.rating).toFixed(1)}/10`
                  : "",
              ].filter(Boolean);
              text.textContent = `Phim đầu tiên trong danh sách là ${firstRecommendedMovie.title}${firstMovieDetails.length ? ` (${firstMovieDetails.join(" · ")})` : ""}.`;
              const latestAssistantMessage = messages.at(-1);
              if (latestAssistantMessage?.role === "assistant") {
                latestAssistantMessage.content = text.textContent;
              }
            }
            const extraSection = document.createElement("div");
            extraSection.className = "assistant-chat-extra-section";
            const heading = document.createElement("p");
            heading.className = "assistant-chat-recommendations-heading";
            const filters = [
              requestedGenres.length
                ? `thể loại ${requestedGenres.join(", ")}`
                : "",
              requestedRating !== null
                ? `IMDb từ ${requestedRating}/10`
                : "",
            ].filter(Boolean);
            heading.textContent = `Phim ${filters.join(" · ")}`;
            extraSection.append(heading);
            const extras = document.createElement("div");
            extras.className = "assistant-chat-more-recommendations";
            genreRecommendations.forEach(({ movie, reasons }) => {
              extras.append(createMovieCard(movie, { reason: reasons[0] }));
            });
            if (!genreRecommendations.length) {
              const emptyNote = document.createElement("p");
              emptyNote.className = "assistant-chat-recommendations-heading";
              emptyNote.textContent = "Chưa có phim thuộc thể loại này trong kho.";
              extraSection.append(emptyNote);
            } else {
              extraSection.append(extras);
            }
            cards.append(extraSection);
          } else {
            cards.append(createMovieCard(firstMentionedMovie, {
              primary: true,
              searched: Boolean(requestedMovie),
            }));
          }
          message.insertBefore(cards, text);

          if (!personalLists.length && firstMentionedMovie && !wantsFilteredList) {
            const extraRecommendations = rankMovieRecommendations({
              movies,
              query: `${userQuery} ${getMovieGenres(firstMentionedMovie).join(" ")}`,
              limit: 4,
              excludeMovieIds: [firstMentionedMovie.id],
            });
            if (extraRecommendations.length) {
              const extraSection = document.createElement("div");
              extraSection.className = "assistant-chat-extra-section";
              const heading = document.createElement("p");
              heading.className = "assistant-chat-recommendations-heading";
              heading.textContent = "Phim cùng thể loại";
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
    const personalLists = getRequestedPersonalSections(content).map(
      (section) => getPersonalListData(section, movies),
    );

    try {
      let answer;
      let notice = "";
      if (personalLists.length) {
        answer = summarizePersonalLists(personalLists);
      } else if (isUnrecognizedMovieRequest(content, movies)) {
        answer = MOVIE_NOT_FOUND_MESSAGE;
      } else {
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
      }

      pendingMessage.remove();
      messages.push({ role: "assistant", content: answer });
      addMessage("assistant", answer, { notice, personalLists });
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

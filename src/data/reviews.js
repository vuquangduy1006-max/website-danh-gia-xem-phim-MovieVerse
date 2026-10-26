const REVIEWS_KEY = "movieverse_reviews";
import { getSession, isAdmin } from "./auth.js";
import { REVIEW_SEED } from "./review-seed.js";

const removedMovieTitles = new Set(
  [
    "The Last Horizon",
    "The Quiet Room",
    "Neon City",
    "Midnight Signal",
    "Blue Summer",
    "Rogue Planet",
    "Paper Hearts",
    "Zootopia 2",
    "Moana 2",
  ].map((title) => title.toLocaleLowerCase("vi")),
);

export function loadReviews() {
  try {
    const parsed = JSON.parse(localStorage.getItem(REVIEWS_KEY));
    if (Array.isArray(parsed)) {
      const activeReviews = parsed.filter(
        (review) =>
          !removedMovieTitles.has(
            String(review.movieTitle ?? "").trim().toLocaleLowerCase("vi"),
          ),
      );
      if (activeReviews.length !== parsed.length) {
        localStorage.setItem(REVIEWS_KEY, JSON.stringify(activeReviews));
      }
      return activeReviews;
    }
  } catch (_) {}
  return [...REVIEW_SEED];
}

export async function syncReviews() {
  const response = await fetch("/api/reviews", { cache: "no-store" });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error || "Không thể tải bình luận từ máy chủ.");
  }
  if (!Array.isArray(payload.reviews)) {
    throw new Error("Máy chủ trả về danh sách bình luận không hợp lệ.");
  }
  saveReviews(payload.reviews);
  return payload.reviews;
}

export function getMovieReviews(title) {
  return loadReviews().filter(
    (review) => review.movieTitle === title && !review.hidden,
  );
}

export function getMovieScoreOutOfTen(movie, reviews) {
  const movieReviews = Array.isArray(reviews)
    ? reviews.filter(
        (review) =>
        review &&
        review.movieTitle === movie?.title &&
          !review.hidden &&
          Number.isInteger(Number(review.rating)) &&
          Number(review.rating) >= 1 &&
          Number(review.rating) <= 5,
      )
    : [];
  if (movieReviews.length) {
    const average =
      movieReviews.reduce((sum, review) => sum + Number(review.rating), 0) /
      movieReviews.length;
    return Number((average * 2).toFixed(1));
  }

  const imdbRating = Number(movie?.rating);
  return Number.isFinite(imdbRating)
    ? Math.min(10, Math.max(0, imdbRating))
    : 0;
}

export function getRatingSummary(title) {
  const list = getMovieReviews(title);
  const total = list.length;
  const average = total
    ? Number((list.reduce((sum, review) => sum + Number(review.rating), 0) / total).toFixed(1))
    : 0;
  const distribution = [1, 2, 3, 4, 5].map((rating) => ({
    rating,
    count: list.filter((review) => Number(review.rating) === rating).length,
  }));
  return { total, average, distribution };
}

export async function addReview(review) {
  const rating = Number(review.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error("Rating must be an integer from 1 to 5");
  }
  await mutateReviews("/api/reviews", "POST", {
    movieTitle: review.movieTitle,
    author: review.author,
    comment: review.comment,
    rating, 
  });
}

export async function deleteReview(id) {
  await mutateReviews(`/api/reviews/${encodeURIComponent(id)}`, "DELETE");
  return true;
}

export async function replyToReview(id, comment) {
  if (!isAdmin() || !comment.trim()) return false;
  return addReviewReply(id, comment);
}

export async function addReviewReply(id, comment) {
  const session = getSession();
  const author = session?.name?.trim();
  const text = comment.trim();
  if (!author || !text || text.length > 280) return false;

  await mutateReviews(`/api/reviews/${encodeURIComponent(id)}/replies`, "POST", {
    author,
    role: session?.role === "admin" ? "admin" : "user",
    comment: text,
  });
  return true;
}

export function getReviewReplies(review) {
  const replies = Array.isArray(review.replies) ? [...review.replies] : [];
  if (
    review.adminReply?.comment &&
    !replies.some((reply) => reply.id === `legacy-admin-${review.id}`)
  ) {
    replies.unshift({
      id: `legacy-admin-${review.id}`,
      author: review.adminReply.author || "MovieVerse Admin",
      role: "admin",
      comment: review.adminReply.comment,
      date: review.adminReply.date,
    });
  }
  return replies;
}

export async function setReviewHidden(id, hidden) {
  if (!isAdmin()) return false;
  await mutateReviews(`/api/reviews/${encodeURIComponent(id)}`, "PATCH", {
    hidden: Boolean(hidden),
  });
  return true;
}

async function mutateReviews(url, method, body) {
  const session = getSession();
  const headers = { "Content-Type": "application/json" };
  const token = session?.token || session?.adminToken;

if (token) {
  headers.Authorization = `Bearer ${token}`;
}
  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error || "Không thể cập nhật bình luận.");
  }
  if (!Array.isArray(payload.reviews)) {
    throw new Error("Máy chủ trả về danh sách bình luận không hợp lệ.");
  }
  saveReviews(payload.reviews);
  return payload.reviews;
}

function saveReviews(reviews) {
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
}

export function getVisibleMovieReviews(title) {
  return getMovieReviews(title);
}
export function getMyReviewHistory() {
  const session = getSession();

  if (!session) return [];

  return loadReviews()
    .filter((review) => {
      return (
        review.author === session.name &&
        !review.hidden
      );
    })
    .sort((a, b) => {
      return new Date(b.date || 0) - new Date(a.date || 0);
    });
}
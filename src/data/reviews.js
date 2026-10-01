const REVIEWS_KEY = "movieverse_reviews";
import { isAdmin } from "./auth.js";

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

const reviewSeed = [
  {
    id: "rv1",
    movieTitle: "Dune: Part Two",
    author: "Minh Anh",
    rating: 5,
    comment:
      "Visual mãn nhãn, âm thanh vang dội. Đúng là bom tấn điện ảnh năm nay!",
    date: "12/06/2025",
  },
  {
    id: "rv2",
    movieTitle: "Dune: Part Two",
    author: "Hoàng Nam",
    rating: 4,
    comment: "Kịch bản tốt nhưng hơi dài ở phân đoạn giữa phim.",
    date: "03/06/2025",
  },
  {
    id: "rv5",
    movieTitle: "Past Lives",
    author: "Linh Chi",
    rating: 5,
    comment: "Một bộ phim nhẹ nhàng nhưng chạm đến trái tim.",
    date: "02/06/2025",
  },
];

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
  return [...reviewSeed];
}

export function getMovieReviews(title) {
  return loadReviews().filter((review) => review.movieTitle === title);
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

export function addReview(review) {
  const rating = Number(review.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error("Rating must be an integer from 1 to 5");
  }
  const all = loadReviews();
  all.unshift({
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    date: formatDate(new Date()),
    ...review,
    rating,
  });
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(all));
}

export function deleteReview(id) {
  if (!isAdmin()) return false;
  const remaining = loadReviews().filter((review) => review.id !== id);
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(remaining));
  return true;
}

export function replyToReview(id, comment) {
  if (!isAdmin() || !comment.trim()) return false;
  const reviews = loadReviews();
  const index = reviews.findIndex((review) => review.id === id);
  if (index === -1) return false;
  reviews[index] = {
    ...reviews[index],
    adminReply: {
      author: "MovieVerse Admin",
      comment: comment.trim(),
      date: formatDate(new Date()),
    },
  };
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
  return true;
}

function formatDate(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${date.getFullYear()}`;
}

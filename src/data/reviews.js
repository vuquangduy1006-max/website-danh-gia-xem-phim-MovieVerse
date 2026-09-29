const REVIEWS_KEY = "movieverse_reviews";

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
    id: "rv3",
    movieTitle: "Rogue Planet",
    author: "Thu Trang",
    rating: 5,
    comment: "Cảm giác mãn nhãn với những khung hình vũ trụ tuyệt đẹp.",
    date: "20/06/2025",
  },
  {
    id: "rv4",
    movieTitle: "Midnight Signal",
    author: "Quốc Bảo",
    rating: 4,
    comment: "Kịch tính từ đầu đến cuối, cái kết gây sốc.",
    date: "18/06/2025",
  },
  {
    id: "rv5",
    movieTitle: "Past Lives",
    author: "Linh Chi",
    rating: 5,
    comment: "Một bộ phim nhẹ nhàng nhưng chạm đến trái tim.",
    date: "02/06/2025",
  },
  {
    id: "rv6",
    movieTitle: "Neon City",
    author: "Đức Huy",
    rating: 3,
    comment: "Bối cảnh đẹp nhưng cốt truyện còn thiếu chiều sâu.",
    date: "25/05/2025",
  },
];

export function loadReviews() {
  try {
    const parsed = JSON.parse(localStorage.getItem(REVIEWS_KEY));
    if (Array.isArray(parsed)) return parsed;
  } catch (_) {}
  return [...reviewSeed];
}

export function getMovieReviews(title) {
  return loadReviews().filter((review) => review.movieTitle === title);
}

export function addReview(review) {
  const all = loadReviews();
  all.unshift({
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    date: formatDate(new Date()),
    ...review,
  });
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(all));
}

function formatDate(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${date.getFullYear()}`;
}

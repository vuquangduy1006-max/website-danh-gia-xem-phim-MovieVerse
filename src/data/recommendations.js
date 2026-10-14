import { getMovieGenres } from "./data.js";

const MOOD_GENRES = [
  { terms: ["vui", "cuoi", "hai huoc", "giai tri"], genres: ["Hài"] },
  {
    terms: ["cang thang", "kich tinh", "hoi hop", "adrenaline"],
    genres: ["Hành động", "Bí ẩn", "Tội phạm"],
  },
  {
    terms: ["nhe nhang", "cham den", "lang man", "tinh cam"],
    genres: ["Tình cảm", "Tâm lý", "Chính kịch"],
  },
  {
    terms: ["gia dinh", "tre em", "am ap"],
    genres: ["Gia đình", "Hoạt hình", "Phiêu lưu"],
  },
  {
    terms: ["so", "ma", "kinh di", "run ray"],
    genres: ["Kinh dị", "Bí ẩn"],
  },
  {
    terms: ["tuong lai", "vu tru", "sci fi", "khoa hoc"],
    genres: ["Khoa học viễn tưởng", "Giả tưởng"],
  },
];

const IGNORED_WORDS = new Set([
  "phim",
  "muon",
  "xem",
  "mot",
  "bo",
  "that",
  "hay",
  "va",
  "cho",
  "toi",
  "minh",
  "co",
  "ve",
  "the",
  "loai",
]);

function normalize(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[đĐ]/g, "d")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("vi");
}

export function findReferencedMovies(query, movies) {
  const normalizedQuery = normalize(query);
  if (!/(?:giong|tuong tu|na na|similar to|like)/.test(normalizedQuery)) {
    return [];
  }

  const queryWords = new Set(normalizedQuery.split(/[^a-z0-9]+/));
  return movies.filter((movie) =>
    normalize(movie.title)
      .split(/[^a-z0-9]+/)
      .some((word) => word.length >= 4 && queryWords.has(word)),
  );
}

export function isMoreRecommendationsRequest(query) {
  const normalizedQuery = normalize(query);
  return (
    /\bthem\b/.test(normalizedQuery) &&
    /\b(?:phim|bo)\b/.test(normalizedQuery) &&
    /\b(?:khac|nua)\b/.test(normalizedQuery)
  );
}

export function rankMovieRecommendations({
  movies,
  reviews = [],
  favoriteIds = [],
  query = "",
  limit = 6,
  excludeMovieIds = [],
}) {
  const favoriteSet = new Set(favoriteIds);
  const excludedSet = new Set(excludeMovieIds);
  const movieByTitle = new Map(movies.map((movie) => [movie.title, movie]));
  const preferredGenres = new Map();
  const addGenrePreference = (movie, weight) => {
    getMovieGenres(movie).forEach((genre) => {
      preferredGenres.set(genre, (preferredGenres.get(genre) || 0) + weight);
    });
  };

  movies
    .filter((movie) => favoriteSet.has(movie.id))
    .forEach((movie) => addGenrePreference(movie, 2));
  reviews.forEach((review) => {
    const movie = movieByTitle.get(review.movieTitle);
    const rating = Number(review.rating);
    if (movie && rating >= 4) addGenrePreference(movie, (rating - 3) * 0.6);
  });

  const normalizedQuery = normalize(query.trim());
  const referencedMovies = findReferencedMovies(normalizedQuery, movies);
  const referencedMovieIds = new Set(referencedMovies.map((movie) => movie.id));
  const words = normalizedQuery
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 2 && !IGNORED_WORDS.has(word));
  const requestedGenres = new Set(
    [...new Set(movies.flatMap(getMovieGenres))].filter((genre) =>
      normalizedQuery.includes(normalize(genre)),
    ),
  );
  const moodGenres = new Set(
    MOOD_GENRES.filter((mood) =>
      mood.terms.some((term) => normalizedQuery.includes(normalize(term))),
    ).flatMap((mood) => mood.genres),
  );

  return movies
    .filter(
      (movie) =>
        !favoriteSet.has(movie.id) &&
        !referencedMovieIds.has(movie.id) &&
        !excludedSet.has(movie.id),
    )
    .map((movie) => {
      const genres = getMovieGenres(movie);
      const content = normalize(
        `${movie.title} ${movie.description} ${genres.join(" ")}`,
      );
      const matchingGenres = genres.filter((genre) =>
        requestedGenres.has(genre),
      );
      const matchingMoods = genres.filter((genre) => moodGenres.has(genre));
      const matchingWords = words.filter((word) => content.includes(word));
      const similarReferences = referencedMovies
        .map((reference) => ({
          movie: reference,
          genres: genres.filter((genre) =>
            getMovieGenres(reference).includes(genre),
          ),
        }))
        .filter((reference) => reference.genres.length);
      const preferredGenre = genres
        .map((genre) => [genre, preferredGenres.get(genre) || 0])
        .sort((a, b) => b[1] - a[1])[0];
      const reasons = [];
      let score = Number(movie.rating) * 0.35;

      if (matchingGenres.length) {
        score += 4;
        reasons.push(`Đúng thể loại ${matchingGenres[0]}`);
      }
      if (matchingMoods.length) {
        score += 2.5;
        if (!matchingGenres.length) reasons.push("Hợp tâm trạng bạn chọn");
      }
      if (similarReferences.length) {
        const reference = similarReferences[0];
        score += 3 + reference.genres.length * 2;
        reasons.push(
          `Có điểm chung với ${reference.movie.title}: ${reference.genres.join(", ")}`,
        );
      }
      if (matchingWords.length) {
        score += Math.min(matchingWords.length, 3) * 1.1;
        if (!matchingGenres.length && !matchingMoods.length) {
          reasons.push("Khớp nội dung bạn mô tả");
        }
      }
      if (preferredGenre?.[1] > 0) {
        score += Math.min(preferredGenre[1], 4);
        reasons.push(`Gần gu ${preferredGenre[0]} của bạn`);
      }
      if (Number(movie.rating) >= 8) reasons.push("Điểm phim nổi bật");
      if (!reasons.length) reasons.push("Gợi ý nổi bật từ kho phim");

      return { movie, score, reasons: reasons.slice(0, 2) };
    })
    .sort(
      (a, b) =>
        b.score - a.score || Number(b.movie.rating) - Number(a.movie.rating),
    )
    .slice(0, limit);
}

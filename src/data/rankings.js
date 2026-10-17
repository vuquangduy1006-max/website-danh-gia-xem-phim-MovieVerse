import { getMovieScoreOutOfTen } from "./reviews.js";

export function getMovieRanking(movies, reviews, period = "all", now = new Date()) {
  if (!["all", "week", "month"].includes(period)) {
    throw new RangeError(`Unsupported ranking period: ${period}`);
  }
  const periodStart = period === "all" ? null : getPeriodStart(period, now);

  const validReviews = Array.isArray(reviews)
    ? reviews.filter((review) => {
        if (!review || review.hidden) return false;
        if (period === "all") return true;
        const reviewDate = parseReviewDate(review.date);
        if (!reviewDate) return false;
        return reviewDate >= periodStart && reviewDate <= now;
      })
    : [];
  const reviewsByMovie = new Map();
  for (const review of validReviews) {
    const movieReviews = reviewsByMovie.get(review.movieTitle) || [];
    movieReviews.push(review);
    reviewsByMovie.set(review.movieTitle, movieReviews);
  }

  return movies
    .flatMap((movie) => {
      const movieReviews = reviewsByMovie.get(movie.title) || [];
      if (period !== "all" && movieReviews.length === 0) return [];
      return [
        {
          movie,
          score: getMovieScoreOutOfTen(movie, movieReviews),
          reviewCount: movieReviews.length,
        },
      ];
    })
    .sort((a, b) => b.score - a.score);
}

function getPeriodStart(period, now) {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  if (period === "week") {
    const daysSinceMonday = (start.getDay() + 6) % 7;
    start.setDate(start.getDate() - daysSinceMonday);
  } else {
    start.setDate(1);
  }
  return start;
}

function parseReviewDate(value) {
  if (typeof value !== "string") return null;
  const text = value.trim();
  const localizedDate = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(text);
  const isoDate = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
  let year;
  let month;
  let day;
  if (localizedDate) {
    [, day, month, year] = localizedDate;
  } else if (isoDate) {
    [, year, month, day] = isoDate;
  } else {
    return null;
  }

  const date = new Date(Number(year), Number(month) - 1, Number(day));
  if (
    date.getFullYear() !== Number(year) ||
    date.getMonth() !== Number(month) - 1 ||
    date.getDate() !== Number(day)
  ) {
    return null;
  }
  return date;
}

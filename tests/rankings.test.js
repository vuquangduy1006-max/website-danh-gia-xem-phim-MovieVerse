import assert from "node:assert/strict";
import test from "node:test";
import { getMovieRanking } from "../src/data/rankings.js";

test("weekly ranking uses only visible reviews from the current Monday-based week", () => {
  const dune = { title: "Dune", rating: 6.2 };
  const pastLives = { title: "Past Lives", rating: 8.1 };
  const movies = [dune, pastLives];
  const reviews = [
    { movieTitle: "Dune", rating: 5, date: "16/06/2025" },
    { movieTitle: "Dune", rating: 3, date: "17/06/2025" },
    { movieTitle: "Dune", rating: 1, date: "15/06/2025" },
    { movieTitle: "Dune", rating: 5, date: "18/06/2025", hidden: true },
    { movieTitle: "Past Lives", rating: 5, date: "15/06/2025" },
  ];

  const ranked = getMovieRanking(
    movies,
    reviews,
    "week",
    new Date(2025, 5, 18, 12),
  );

  assert.deepEqual(
    ranked.map(({ movie, score, reviewCount }) => ({
      title: movie.title,
      score,
      reviewCount,
    })),
    [{ title: "Dune", score: 8, reviewCount: 2 }],
  );
});

test("monthly ranking uses visible reviews from the current calendar month", () => {
  const movie = { title: "Dune", rating: 6.2 };
  const ranked = getMovieRanking(
    [movie],
    [
      { movieTitle: "Dune", rating: 5, date: "2025-06-02" },
      { movieTitle: "Dune", rating: 3, date: "17/06/2025" },
      { movieTitle: "Dune", rating: 1, date: "31/05/2025" },
    ],
    "month",
    new Date(2025, 5, 18, 12),
  );

  assert.deepEqual(ranked, [{ movie, score: 8, reviewCount: 2 }]);
});

test("all-time ranking keeps IMDb fallback for movies without reviews", () => {
  const movie = { title: "No recent reviews", rating: 7.6 };
  assert.deepEqual(getMovieRanking([movie], [], "all"), [
    { movie, score: 7.6, reviewCount: 0 },
  ]);
});

test("rejects unsupported ranking periods", () => {
  assert.throws(
    () => getMovieRanking([], [], "year"),
    { name: "RangeError" },
  );
});

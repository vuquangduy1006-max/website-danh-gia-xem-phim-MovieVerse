import assert from "node:assert/strict";
import test from "node:test";
import { getMovieScoreOutOfTen } from "../src/data/reviews.js";

test("converts visible community ratings to the same ten-point scale as IMDb", () => {
  const movie = { title: "Example Film", rating: "8.2" };
  const reviews = [
    { movieTitle: movie.title, rating: 5 },
    { movieTitle: movie.title, rating: 4 },
    { movieTitle: "Another Film", rating: 1 },
  ];

  assert.equal(getMovieScoreOutOfTen(movie, reviews), 9);
});

test("uses IMDb when a film has no visible community reviews", () => {
  const movie = { title: "Example Film", rating: "7.6" };
  const reviews = [
    { movieTitle: movie.title, rating: 1, hidden: true },
    { movieTitle: "Another Film", rating: 5 },
  ];

  assert.equal(getMovieScoreOutOfTen(movie, reviews), 7.6);
});

test("returns a safe ten-point fallback for missing or invalid IMDb ratings", () => {
  assert.equal(getMovieScoreOutOfTen({ title: "No rating" }, []), 0);
  assert.equal(
    getMovieScoreOutOfTen({ title: "Invalid rating", rating: "unknown" }, []),
    0,
  );
});

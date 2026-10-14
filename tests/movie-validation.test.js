import assert from "node:assert/strict";
import test from "node:test";
import {
  isValidMediaUrl,
  isValidReleaseYear,
} from "../src/data/movie-validation.js";

test("accepts release years up to the current year", () => {
  assert.equal(isValidReleaseYear("2026", 2026), true);
  assert.equal(isValidReleaseYear("1900", 2026), true);
});

test("rejects release years after the current year", () => {
  assert.equal(isValidReleaseYear("2027", 2026), false);
});

test("rejects malformed years and years before the supported range", () => {
  assert.equal(isValidReleaseYear("", 2026), false);
  assert.equal(isValidReleaseYear("2026.5", 2026), false);
  assert.equal(isValidReleaseYear("1899", 2026), false);
});

test("accepts HTTP and HTTPS media links", () => {
  assert.equal(isValidMediaUrl("https://youtu.be/abcdefghijk"), true);
  assert.equal(isValidMediaUrl("http://media.example.com/episode.mp4"), true);
});

test("rejects malformed media links and unsafe protocols", () => {
  assert.equal(isValidMediaUrl(""), false);
  assert.equal(isValidMediaUrl("javascript:alert(1)"), false);
  assert.equal(isValidMediaUrl("/videos/episode.mp4"), false);
  assert.equal(isValidMediaUrl("https://www.youtube.com/watch?v=bad"), false);
});

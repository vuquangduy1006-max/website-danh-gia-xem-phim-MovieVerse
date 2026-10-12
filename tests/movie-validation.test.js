import assert from "node:assert/strict";
import test from "node:test";
import { isValidReleaseYear } from "../src/data/movie-validation.js";

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

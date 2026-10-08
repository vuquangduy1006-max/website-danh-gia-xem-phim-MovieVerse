import test from "node:test";
import assert from "node:assert/strict";
import {
  answerFromCatalog,
  hasMovieRecommendationIntent,
} from "../assistant-recommendations.js";

const catalog = [
  {
    id: "m1",
    title: "Dune: Part Two",
    year: "2024",
    genre: "Khoa học viễn tưởng",
    rating: "8.8",
    description: "Paul Atreides chiến đấu bảo vệ gia đình.",
  },
  {
    id: "m2",
    title: "Past Lives",
    year: "2023",
    genre: "Tâm lý",
    rating: "8.1",
    description: "Hai người bạn thời thơ ấu gặp lại nhau.",
  },
  {
    id: "m3",
    title: "Superman",
    year: "2025",
    genre: "Hành động",
    rating: "7.1",
    description: "Siêu anh hùng bảo vệ Trái Đất.",
  },
];

const moodCatalog = [
  {
    id: "m4",
    title: "Kiki’s Delivery",
    year: "2024",
    genre: "Hoạt hình",
    rating: "8.3",
    description:
      "Một cô phù thủy trẻ bắt đầu cuộc sống mới trong thành phố ven biển đầy màu sắc.",
  },
  {
    id: "m5",
    title: "The Wild Robot",
    year: "2024",
    genre: "Hoạt hình",
    rating: "8.2",
    description:
      "Robot Roz học cách sinh tồn và chăm sóc một chú ngỗng con trên hòn đảo hoang.",
  },
];

test("recommends Dune for action and a roughly two-hour request with verified runtime", () => {
  const question =
    "Tối nay tôi muốn xem phim khoảng 2 tiếng, thể loại hành động.";

  assert.equal(hasMovieRecommendationIntent(question), true);
  assert.equal(
    answerFromCatalog(question, catalog),
    "Bạn có thể xem Dune: Part Two. Phim dài 2 giờ 46 phút, thuộc thể loại khoa học viễn tưởng, hành động, ra mắt năm 2024, điểm IMDb 8.8/10.",
  );
});

test("does not interpret a two-hour duration as a comedy genre", () => {
  assert.equal(
    hasMovieRecommendationIntent("Tôi muốn xem phim khoảng 2 tiếng."),
    true,
  );
});

test("filters recommendations by year and minimum IMDb rating", () => {
  const question = "Gợi ý phim hành động năm 2024, IMDb trên 8.";

  assert.equal(hasMovieRecommendationIntent(question), true);
  assert.match(answerFromCatalog(question, catalog), /Dune: Part Two/);
  assert.doesNotMatch(answerFromCatalog(question, catalog), /Superman/);
});

test("does not recommend movies that fail an explicit runtime limit", () => {
  const answer = answerFromCatalog(
    "Phim hành động dưới 2 tiếng.",
    catalog,
  );

  assert.match(answer, /chưa tìm thấy phim nào khớp tất cả tiêu chí/i);
});

test("does not recommend movies outside an explicit release-year range", () => {
  const answer = answerFromCatalog(
    "Phim hành động từ 2025 đến 2026.",
    catalog,
  );

  assert.match(answer, /Superman/);
  assert.doesNotMatch(answer, /Dune: Part Two/);
});

test("does not make up a runtime for movies without verified runtime data", () => {
  const answer = answerFromCatalog("Gợi ý phim tâm lý", catalog);

  assert.match(answer, /Past Lives/);
  assert.doesNotMatch(answer, /phút|giờ/);
});

test("understands casual sadness and picks an empathetic relationship story", () => {
  const question =
    "Mình vừa chia tay, tâm trạng buồn và hơi cô đơn. Có phim nào đồng cảm không?";
  const answer = answerFromCatalog(question, [
    catalog[1],
    moodCatalog[0],
    catalog[2],
  ]);

  assert.equal(hasMovieRecommendationIntent(question), true);
  assert.match(answer, /Past Lives/);
  assert.match(answer, /sâu lắng, giàu cảm xúc/);
});

test("understands needing comfort and recommends a warm, uplifting movie", () => {
  const question =
    "Hôm nay mình mệt mỏi và áp lực, muốn được an ủi một chút.";
  const answer = answerFromCatalog(question, moodCatalog);

  assert.equal(hasMovieRecommendationIntent(question), true);
  assert.match(answer, /Kiki’s Delivery/);
  assert.match(answer, /nhẹ nhàng, ấm áp/);
});

test("does not map work stress to a tense action movie", () => {
  const question =
    "Sau một ngày làm việc căng thẳng, mình muốn thư giãn nhẹ nhàng.";
  const answer = answerFromCatalog(question, [
    catalog[2],
    moodCatalog[0],
  ]);

  assert.match(answer, /Kiki’s Delivery/);
  assert.doesNotMatch(answer, /Superman/);
});

test("does not recommend a random movie when its genre cannot match the mood", () => {
  const answer = answerFromCatalog("Tôi muốn xem phim kinh dị thật đáng sợ.", [
    catalog[0],
    catalog[2],
  ]);

  assert.match(answer, /chưa tìm thấy phim nào khớp tất cả tiêu chí/i);
});

import "../css/style.css";
import { getMovieDB } from "./data.js";
const movies = getMovieDB();
const id = new URLSearchParams(location.search).get("id");
const movie = movies.find((item) => item.id === id);
const app = document.querySelector("#app");
if (!movie) {
  app.innerHTML = `<main class="detail-empty container"><h1>Không tìm thấy phim</h1><a class="watch-button" href="/index.html#movies">← Quay lại danh sách phim</a></main>`;
} else {
  document.title = `${movie.title} | MovieVerse`;
  app.innerHTML = `<main class="movie-detail" style="--detail-bg:url('${movie.backdrop}')"><div class="detail-shade"></div><div class="container detail-content"><div class="detail-poster" style="background-image:url('${movie.poster}')"></div><div class="detail-copy"><p class="eyebrow">MovieVerse · Chi tiết phim</p><h1>${movie.title}</h1><div class="hero-meta"><span>IMDb <strong>${movie.rating}</strong></span><span>${movie.year}</span><span>${movie.genre}</span></div><p>${movie.description}</p><a class="watch-button detail-back" href="/index.html#movies">← Khám phá phim khác</a></div></div></main>`;
}

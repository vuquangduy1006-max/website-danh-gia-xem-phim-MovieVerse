const movies = [
  {
    title: "Dune: Part Two",
    year: "2024",
    genre: "Khoa học viễn tưởng",
    rating: "8.8",
    poster:
      "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=600&q=85",
    backdrop:
      "https://images.unsplash.com/photo-1500534623283-312aade485b7?w=1800&q=85",
    description:
      "Paul Atreides hợp nhất với Chani và người Fremen trong hành trình trả thù những kẻ đã hủy diệt gia đình mình.",
  },
  {
    title: "The Last Horizon",
    year: "2024",
    genre: "Hành động",
    rating: "8.5",
    poster:
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&q=85",
    backdrop:
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=1800&q=85",
    description:
      "Một phi hành đoàn đơn độc phải vượt qua rìa của vũ trụ để mang hy vọng cuối cùng trở về Trái Đất.",
  },
  {
    title: "Past Lives",
    year: "2023",
    genre: "Tâm lý",
    rating: "8.1",
    poster:
      "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&q=85",
    backdrop:
      "https://images.unsplash.com/photo-1514905552197-0610a4d8fd73?w=1800&q=85",
    description:
      "Hai người bạn thời thơ ấu gặp lại nhau sau nhiều năm, đối diện với những điều chưa từng nói.",
  },
  {
    title: "Kiki’s Delivery",
    year: "2024",
    genre: "Hoạt hình",
    rating: "8.3",
    poster:
      "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&q=85",
    backdrop:
      "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=1800&q=85",
    description:
      "Một cô phù thủy trẻ bắt đầu cuộc sống mới trong thành phố ven biển đầy màu sắc.",
  },
  {
    title: "Civil War",
    year: "2024",
    genre: "Hành động",
    rating: "7.9",
    poster:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&q=85",
    backdrop:
      "https://images.unsplash.com/photo-1500534623283-312aade485b7?w=1800&q=85",
    description:
      "Một nhóm phóng viên chạy đua với thời gian để ghi lại khoảnh khắc lịch sử của một đất nước.",
  },
  {
    title: "The Quiet Room",
    year: "2023",
    genre: "Tâm lý",
    rating: "7.8",
    poster:
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=600&q=85",
    backdrop:
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1800&q=85",
    description:
      "Một căn phòng im lặng, một bí mật cũ và cuộc đối thoại có thể thay đổi tất cả.",
  },
  {
    title: "Neon City",
    year: "2024",
    genre: "Khoa học viễn tưởng",
    rating: "8.0",
    poster:
      "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=600&q=85",
    backdrop:
      "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1800&q=85",
    description:
      "Thành phố không bao giờ ngủ che giấu những câu chuyện của những người sống dưới ánh đèn neon.",
  },
  {
    title: "Wildwood",
    year: "2024",
    genre: "Hoạt hình",
    rating: "7.7",
    poster:
      "https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&q=85",
    backdrop:
      "https://images.unsplash.com/photo-1448375240586-882707db888b?w=1800&q=85",
    description:
      "Một cô bé bước vào khu rừng kỳ diệu để tìm lại người anh trai mất tích.",
  },
];
const heroMovies = movies.slice(0, 3);
const newMovies = [
  {
    title: "Midnight Signal",
    year: "2024",
    genre: "Bí ẩn",
    rating: "8.4",
    poster:
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&q=85",
    description:
      "Một tín hiệu lạ xuất hiện giữa đêm và kéo một kỹ sư trẻ vào bí mật bị chôn vùi nhiều năm.",
  },
  {
    title: "Blue Summer",
    year: "2024",
    genre: "Tâm lý",
    rating: "8.0",
    poster:
      "https://images.unsplash.com/photo-1507525422872-b6696d73aee5?w=600&q=85",
    description:
      "Một mùa hè ngắn ngủi khiến ba người xa lạ nhìn lại những lựa chọn của mình.",
  },
  {
    title: "Rogue Planet",
    year: "2024",
    genre: "Khoa học viễn tưởng",
    rating: "8.6",
    poster:
      "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=600&q=85",
    description:
      "Phi hành đoàn cuối cùng của nhân loại tìm thấy một hành tinh có thể là ngôi nhà mới.",
  },
  {
    title: "Paper Hearts",
    year: "2024",
    genre: "Tâm lý",
    rating: "7.9",
    poster:
      "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=600&q=85",
    description:
      "Những lá thư chưa gửi kết nối hai thế hệ trong một câu chuyện dịu dàng về gia đình.",
  },
];
let currentSlide = 0;
let slideTimer;
const posterStyle = (movie) => `background-image:url('${movie.poster}')`;
function renderHero() {
  document.querySelector("#heroSlides").innerHTML = heroMovies
    .map(
      (movie, index) =>
        `<article class="hero-slide ${index === 0 ? "active" : ""}" style="background-image:url('${movie.backdrop}')"><div class="hero-copy"><span class="kicker">Phim nổi bật · ${movie.year}</span><h1>${movie.title}</h1><div class="hero-meta"><span>IMDb <strong>${movie.rating}</strong></span><span>${movie.genre}</span><span>2h 46m</span></div><p>${movie.description}</p><button class="watch-button" data-movie="${movie.title}">▶ &nbsp;Xem ngay</button></div></article>`,
    )
    .join("");
  document.querySelector("#sliderDots").innerHTML = heroMovies
    .map(
      (_, index) =>
        `<button class="${index === 0 ? "active" : ""}" data-slide="${index}" aria-label="Đến phim ${index + 1}"></button>`,
    )
    .join("");
  document
    .querySelectorAll("[data-movie]")
    .forEach((button) =>
      button.addEventListener("click", () => openModal(button.dataset.movie)),
    );
  document
    .querySelectorAll("[data-slide]")
    .forEach((button) =>
      button.addEventListener("click", () =>
        goToSlide(Number(button.dataset.slide)),
      ),
    );
  startSlider();
}
function goToSlide(index) {
  currentSlide = (index + heroMovies.length) % heroMovies.length;
  document
    .querySelectorAll(".hero-slide")
    .forEach((slide, i) =>
      slide.classList.toggle("active", i === currentSlide),
    );
  document
    .querySelectorAll(".slider-dots button")
    .forEach((dot, i) => dot.classList.toggle("active", i === currentSlide));
  clearInterval(slideTimer);
  startSlider();
}
function startSlider() {
  slideTimer = setInterval(() => goToSlide(currentSlide + 1), 6500);
}
function renderMovies(filter = "all") {
  const shown =
    filter === "all"
      ? movies
      : movies.filter((movie) => movie.genre === filter);
  document.querySelector("#movieGrid").innerHTML = shown
    .map(
      (movie, index) =>
        `<article class="movie-card" style="animation-delay:${index * 0.05}s"><div class="poster" style="${posterStyle(movie)}"><button class="play-circle" aria-label="Xem ${movie.title}" data-movie="${movie.title}">▶</button></div><h3>${movie.title}<span class="card-rating">★ ${movie.rating}</span></h3><p>${movie.year} · ${movie.genre}</p></article>`,
    )
    .join("");
  document
    .querySelectorAll("#movieGrid [data-movie]")
    .forEach((button) =>
      button.addEventListener("click", () => openModal(button.dataset.movie)),
    );
}
function renderRanking() {
  document.querySelector("#rankingList").innerHTML = movies
    .slice(0, 6)
    .map(
      (movie, index) =>
        `<article class="rank-item"><span class="rank-number">0${index + 1}</span><div class="rank-poster" style="${posterStyle(movie)}"></div><div class="rank-info"><h3>${movie.title}</h3><p>${movie.year} · ${movie.genre}</p></div><span class="rank-score">★ ${movie.rating}</span></article>`,
    )
    .join("");
}
function renderNewMovies() {
  const newMovieGrid = document.querySelector("#newMovieGrid");
  newMovieGrid.innerHTML = newMovies
    .map(
      (movie, index) =>
        `<article class="movie-card" style="animation-delay:${index * 0.05}s"><div class="poster" style="${posterStyle(movie)}"><button class="play-circle" aria-label="Xem ${movie.title}" data-new-movie="${movie.title}">▶</button></div><h3>${movie.title}<span class="card-rating">★ ${movie.rating}</span></h3><p>${movie.year} · ${movie.genre}</p></article>`,
    )
    .join("");
  newMovieGrid
    .querySelectorAll("[data-new-movie]")
    .forEach((button) =>
      button.addEventListener("click", () =>
        openNewMovieModal(button.dataset.newMovie),
      ),
    );
}
function openNewMovieModal(title) {
  const movie = newMovies.find((item) => item.title === title);
  if (!movie) return;
  document.querySelector("#modalTitle").textContent = movie.title;
  document.querySelector("#modalDescription").textContent = movie.description;
  document.querySelector("#modalMeta").textContent =
    `${movie.year} · ${movie.genre} · Phim mới`;
  document.querySelector("#modalRating").textContent = movie.rating;
  document.querySelector("#modalArt").style.backgroundImage =
    `url('${movie.poster}')`;
  document.querySelector("#movieModal").classList.add("open");
}
function openModal(title) {
  const movie = movies.find((item) => item.title === title);
  if (!movie) return;
  document.querySelector("#modalTitle").textContent = movie.title;
  document.querySelector("#modalDescription").textContent = movie.description;
  document.querySelector("#modalMeta").textContent =
    `${movie.year} · ${movie.genre} · 2h 14m`;
  document.querySelector("#modalRating").textContent = movie.rating;
  document.querySelector("#modalArt").style.backgroundImage =
    `url('${movie.poster}')`;
  document.querySelector("#movieModal").classList.add("open");
  document.querySelector("#movieModal").setAttribute("aria-hidden", "false");
}
function closeModal() {
  document.querySelector("#movieModal").classList.remove("open");
  document.querySelector("#movieModal").setAttribute("aria-hidden", "true");
}
function closeSearch() {
  document.querySelector("#searchOverlay").classList.remove("open");
}
function renderSearch(query = "") {
  const results = movies.filter((movie) =>
    movie.title.toLowerCase().includes(query.toLowerCase()),
  );
  document.querySelector("#searchResults").innerHTML = query
    ? results
        .map(
          (movie) =>
            `<button class="search-result" data-movie="${movie.title}"><img src="${movie.poster}" alt=""><p>${movie.title}<br><small>${movie.year} · ${movie.genre}</small></p></button>`,
        )
        .join("")
    : '<p style="color:var(--muted);margin-top:22px">Nhập tên phim để bắt đầu tìm kiếm.</p>';
  document.querySelectorAll("#searchResults [data-movie]").forEach((button) =>
    button.addEventListener("click", () => {
      closeSearch();
      openModal(button.dataset.movie);
    }),
  );
}
renderHero();
renderMovies();
renderRanking();
renderNewMovies();
document
  .querySelector("#prevSlide")
  .addEventListener("click", () => goToSlide(currentSlide - 1));
document
  .querySelector("#nextSlide")
  .addEventListener("click", () => goToSlide(currentSlide + 1));
document.querySelectorAll(".pill").forEach((pill) =>
  pill.addEventListener("click", () => {
    document
      .querySelectorAll(".pill")
      .forEach((item) => item.classList.remove("active"));
    pill.classList.add("active");
    renderMovies(pill.dataset.filter);
  }),
);
document.querySelector(".search-trigger").addEventListener("click", () => {
  document.querySelector("#searchOverlay").classList.add("open");
  document.querySelector("#searchInput").focus();
});
document.querySelector(".close-search").addEventListener("click", closeSearch);
document
  .querySelector("#searchInput")
  .addEventListener("input", (event) => renderSearch(event.target.value));
document.querySelector("#searchOverlay").addEventListener("click", (event) => {
  if (event.target.id === "searchOverlay") closeSearch();
});
document.querySelector(".modal-backdrop").addEventListener("click", closeModal);
document.querySelector(".modal-close").addEventListener("click", closeModal);
document
  .querySelector(".menu-toggle")
  .addEventListener("click", () =>
    document.querySelector(".main-nav").classList.toggle("mobile-open"),
  );
document.querySelector("#subscribeForm").addEventListener("submit", (event) => {
  event.preventDefault();
  event.target.innerHTML =
    '<p style="color:var(--accent);margin:0">Cảm ơn bạn đã đăng ký!</p>';
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeModal();
    closeSearch();
  }
});

import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL("./index.html", import.meta.url)),
        admin: fileURLToPath(new URL("./admin.html", import.meta.url)),
        adminComments: fileURLToPath(new URL("./admin/comments.html", import.meta.url)),
        newMovies: fileURLToPath(new URL("./new-movies.html", import.meta.url)),
        reviews: fileURLToPath(new URL("./reviews.html", import.meta.url)),
        ranking: fileURLToPath(new URL("./ranking.html", import.meta.url)),
        favorites: fileURLToPath(new URL("./favorites.html", import.meta.url)),
        movieDetail: fileURLToPath(
          new URL("./movie-detail.html", import.meta.url),
        ),
        watch: fileURLToPath(new URL("./watch.html", import.meta.url)),
      },
    },
  },
});

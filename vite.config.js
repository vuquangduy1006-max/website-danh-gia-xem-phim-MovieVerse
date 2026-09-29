import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL("./index.html", import.meta.url)),
        newMovies: fileURLToPath(new URL("./new-movies.html", import.meta.url)),
        login: fileURLToPath(new URL("./login.html", import.meta.url)),
        register: fileURLToPath(new URL("./register.html", import.meta.url)),
        admin: fileURLToPath(new URL("./admin/admin.html", import.meta.url)),
      },
    },
  },
});

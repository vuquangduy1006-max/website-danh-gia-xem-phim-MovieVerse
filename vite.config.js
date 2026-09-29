import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        home: fileURLToPath(new URL("./index.html", import.meta.url)),
        main: fileURLToPath(
          new URL("./src/pages/index.html", import.meta.url)
        ),
        admin: fileURLToPath(
          new URL("./src/pages/admin.html", import.meta.url)
        ),
        review: fileURLToPath(
          new URL("./src/pages/review.html", import.meta.url)
        ),
      },
    },
  },
});
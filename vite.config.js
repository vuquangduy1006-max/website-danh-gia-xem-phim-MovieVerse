import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL("./pages/index.html", import.meta.url)),
        admin: fileURLToPath(new URL("./pages/admin.html", import.meta.url)),
        review: fileURLToPath(new URL("./pages/review.html", import.meta.url)),
      },
    },
  },
});
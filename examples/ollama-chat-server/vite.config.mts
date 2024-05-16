import { defineConfig } from "vite";
import { externalizeDeps as external } from "vite-plugin-externalize-deps";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    external()
  ],
  build: {
    copyPublicDir: false,
    lib: {
      entry: "src/main.mts",
      formats: ["es"],
      fileName: "server",
    }
  },
});

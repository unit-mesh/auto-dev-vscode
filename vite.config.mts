import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import { externalizeDeps } from "vite-plugin-externalize-deps";
import { viteStaticCopy } from "vite-plugin-static-copy";

// https://vitejs.dev/config/
export default defineConfig((api) => {
  const isDev = api.mode === "development";

  return {
    plugins: [
      externalizeDeps({
        include: ["vscode"],
      }),
      isDev && dts(),
      viteStaticCopy({
        targets: [
          {
            src: "node_modules/@unit-mesh/treesitter-artifacts/wasm",
            dest: "tree-sitter-wasms",
          },
          {
            src: "node_modules/web-tree-sitter/tree-sitter.wasm",
            dest: "tree-sitter.wasm",
          },
          {
            src: "src/semantic-treesitter/**/*.scm",
            dest: "semantic",
          },
        ],
      }),
    ],
    build: {
      minify: !isDev,
      sourcemap: isDev,
      lib: {
        entry: "src/extension.ts",
        formats: ["cjs"],
        fileName: "extension",
      },
    },
  };
});

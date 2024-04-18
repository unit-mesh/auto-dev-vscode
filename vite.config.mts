/// <reference types="vitest" />
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
        except: [
          "web-tree-sitter",
        ]
      }),
      isDev && dts(),
      viteStaticCopy({
        targets: [
          {
            src: "node_modules/@unit-mesh/treesitter-artifacts/wasm/*.wasm",
            dest: "tree-sitter-wasms",
          },
          {
            src: "node_modules/web-tree-sitter/*.wasm",
            dest: "",
          },
          {
            src: "src/semantic/**/*.scm",
            dest: "semantic",
          },
        ],
      }),
    ],
    build: {
      minify: !isDev,
      sourcemap: isDev,
      copyPublicDir: false,
      lib: {
        entry: "src/extension.ts",
        formats: ["cjs"],
        fileName: "extension",
      },
    },
    test: {
      include: ["src/test/**/*.test.ts"],
      globals: true,
      coverage: {
        // you can include other reporters, but 'json-summary' is required, json is recommended
        reporter: ['text', 'json-summary', 'json'],
        // If you want a coverage reports even if your tests are failing, include the reportOnFailure option
        reportOnFailure: true,
        // thresholds: {
        //   lines: 10,
        //   branches: 10,
        //   functions: 10,
        //   statements: 10
        // }
      },
    }
  };
});

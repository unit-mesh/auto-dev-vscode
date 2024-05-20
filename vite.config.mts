/// <reference types="vitest" />
import path from "node:path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import { externalizeDeps } from "vite-plugin-externalize-deps";
import { viteStaticCopy } from "vite-plugin-static-copy";

// https://vitejs.dev/config/
export default defineConfig((api) => {
  const isDev = api.mode === "development";

  return {
    resolve: {
      alias: {
        // hack bindings of sqlite3
        bindings: path.join(__dirname, "vendors/bindings/index.js"),
        // hack onnxruntime-node
        'onnxruntime-node': path.join(__dirname, "vendors/onnxruntime-node/index.cjs")
      },
    },
    plugins: [
      externalizeDeps({
        deps: false,
        include: ["vscode"],
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
            src: "src/code-search/schemas/indexes/*.scm",
            dest: "semantic",
          },
          {
            src: "node_modules/onnxruntime-node/bin",
            dest: "",
          },
          {
            src: "node_modules/sqlite3/build",
            dest: "",
          },
          {
            src: "node_modules/@lancedb",
            dest: "node_modules/",
          },
          {
            src: "bin/**",
            dest: "build/",
          },
          {
            src: "package.json",
            dest: "",
          },
          {
            src: "models/",
            dest: "",
          },
          {
            src: "autodev_tutorial.py",
            dest: "",
          },
        ],
      }),
    ],
    build: {
      minify: false,
      sourcemap: true,
      copyPublicDir: false,
      lib: {
        entry: "src/extension.ts",
        formats: ["cjs"],
        fileName: "extension",
      },
      commonjsOptions: {
        ignoreDynamicRequires: true,
        dynamicRequireRoot: "/",
        dynamicRequireTargets: [
          './bin/napi-v3/**/onnxruntime_binding.node'
        ],
      }
    },
    test: {
      include: ["src/test/**/*.test.ts"],
      globals: true,
      coverage: {
        // you can include other reporters, but 'json-summary' is required, json is recommended
        reporter: ["text", "json-summary", "json"],
        // If you want a coverage reports even if your tests are failing, include the reportOnFailure option
        reportOnFailure: true,
        // thresholds: {
        //   lines: 10,
        //   branches: 10,
        //   functions: 10,
        //   statements: 10
        // }
      },
    },
  };
});

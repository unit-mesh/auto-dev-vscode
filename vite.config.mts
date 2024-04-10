import { defineConfig } from "vite";
// import checker from "vite-plugin-checker";
import dts from 'vite-plugin-dts';
import { externalizeDeps } from "vite-plugin-externalize-deps";
import { viteStaticCopy } from 'vite-plugin-static-copy'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    externalizeDeps({
      include: ["vscode"],
    }),
    // checker({ typescript: true }),
    dts(),
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/web-tree-sitter/tree-sitter.wasm',
          dest: 'tree-sitter-wasms/tree-sitter-javascript.wasm'
        }
      ]
    }),
  ],
  build: {
    minify: false,
    sourcemap: true,
    lib: {
      entry: "src/extension.ts",
      formats: ["cjs"],
      fileName: 'extension'
    },
  },
});

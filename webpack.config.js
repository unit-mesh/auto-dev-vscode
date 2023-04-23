//@ts-check

'use strict';

const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

//@ts-check
/** @typedef {import('webpack').Configuration} WebpackConfig **/

/** @type WebpackConfig */
const extensionConfig = {
  target: 'node', // VS Code extensions run in a Node.js-context 📖 -> https://webpack.js.org/configuration/node/
  node: {
    __dirname: false,
  },
  mode: 'none', // this leaves the source code as close as possible to the original (when packaging we set this to 'production')

  entry: {
    treesitter: './node_modules/tree-sitter/index.js',
    treesitter_c: './node_modules/tree-sitter-c/bindings/node/index.js',
    treesitter_csharp: './node_modules/tree-sitter-c-sharp/bindings/node/index.js',
    treesitter_cpp: './node_modules/tree-sitter-cpp/bindings/node/index.js',
    treesitter_go: './node_modules/tree-sitter-go/bindings/node/index.js',
    treesitter_haskell: './node_modules/tree-sitter-haskell/index.js',
    treesitter_java: './node_modules/tree-sitter-java/bindings/node/index.js',
    treesitter_javascript: './node_modules/tree-sitter-javascript/bindings/node/index.js',
    treesitter_kotlin: './node_modules/tree-sitter-kotlin/bindings/node/index.js',
    treesitter_lua: './node_modules/tree-sitter-lua/bindings/node/index.js',
    treesitter_python: './node_modules/tree-sitter-python/bindings/node/index.js',
    treesitter_rust: './node_modules/tree-sitter-rust/bindings/node/index.js',
    treessitter_swift: './node_modules/tree-sitter-swift/bindings/node/index.js',
    treesitter_typescript: './node_modules/tree-sitter-typescript/bindings/node/index.js',
    treesitter_zig: './node_modules/tree-sitter-zig/index.js',

    index: {
      dependOn: [
        'treesitter',
        'treesitter_c',
        'treesitter_csharp',
        'treesitter_cpp',
        'treesitter_go',
        'treesitter_haskell',
        'treesitter_java',
        'treesitter_javascript',
        'treesitter_kotlin',
        'treesitter_lua',
        'treesitter_python',
        'treesitter_rust',
        'treessitter_swift',
        'treesitter_typescript',
        'treesitter_zig',
      ],
      import: "./src/extension.ts",
      filename: "extension.js",
    },
  }, // the entry point of this extension, 📖 -> https://webpack.js.org/configuration/entry-context/
  output: {
    // the bundle is stored in the 'dist' folder (check package.json), 📖 -> https://webpack.js.org/configuration/output/
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'commonjs2'
  },
  externals: {
    vscode: 'commonjs vscode' // the vscode-module is created on-the-fly and must be excluded. Add other modules that cannot be webpack'ed, 📖 -> https://webpack.js.org/configuration/externals/
    // modules added here also need to be added in the .vscodeignore file
  },
  resolve: {
    // support reading TypeScript and JavaScript files, 📖 -> https://github.com/TypeStrong/ts-loader
    extensions: ['.ts', '.js', '.node']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader'
          }
        ]
      },
      {
        test: /\.node$/,
        loader: "node-loader",
      },
    ]
  },
  devtool: 'nosources-source-map',
  infrastructureLogging: {
    level: "log", // enables logging required for problem matchers
  },
  plugins: [
    // new CopyWebpackPlugin({
    //   patterns: [
    //     { from: 'node_modules/tree-sitter/build', to: 'build' },
    //   ],
    // }),
  ],
};
module.exports = [ extensionConfig ];
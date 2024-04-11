// .vscode-test.js
const { defineConfig } = require('@vscode/test-cli');

module.exports = defineConfig([
  {
    label: 'unitTests',
    files: 'src/integration-test/**/*.test.ts',
    version: 'insiders',
    workspaceFolder: './sampleWorkspace'
  }
  // you can specify additional test configurations, too
]);

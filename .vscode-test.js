// .vscode-test.js
const { defineConfig } = require('@vscode/test-cli');

module.exports = defineConfig([
  {
    label: 'integrationTest',
    files: 'out/integration-test/**/*.test.js',
    version: 'insiders',
    workspaceFolder: './sampleWorkspace'
  }
  // you can specify additional test configurations, too
]);

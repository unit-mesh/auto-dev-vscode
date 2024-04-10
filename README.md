<p align="center">
  <img src="images/pluginIcon.png" width="160px" height="160px"  alt="logo" />
</p>
<h1 align="center">AutoDev VSCode</h1>

![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/Phodal.autodev)
[![CI](https://github.com/unit-mesh/auto-dev-vscode/actions/workflows/ci.yml/badge.svg)](https://github.com/unit-mesh/auto-dev-vscode/actions/workflows/ci.yml)

> 🧙‍AutoDev: The AI-powered coding wizard with multilingual support 🌐, auto code generation 🏗️, and a helpful
> bug-slaying assistant 🐞! Customizable prompts 🎨 and a magic Auto Dev/Testing/Document/Agent feature 🧪 included! 🚀

## Todos

- [ ] Custom LLM config
- [ ] Chat mode
    - [ ] Chat UI
    - [ ] Chat with selection
    - [ ] Chat with code
- [ ] Semantic Analysis for multiple languages
    - [x] TreeSitter
        - [x] Class level
        - [x] Method level
        - spike for Variable level, since is not easy to implement
    - [ ] Language Server Protocol
        - [ ] Java
        - [ ] Python
- [ ] DevIns language support
    - [ ] Syntax Highlight
    - [ ] Custom command
- [ ] Custom prompt
    - [ ] Json Schema validation
    - [ ] Custom prompt settings
- [ ] Real-time Assistant
    - [X] QuickFix: Alt + Enter
    - [ ] Hover to show
- [ ] Custom Agent
    - [ ] Custom Agent
    - [ ] Custom Agent API
- [ ] Extensions
    - [ ] Database
    - [ ] Terminal
    - [ ] UI
- [ ] Local embedding with ONNX

## Resources

test TreeSitter: [https://tree-sitter.github.io/tree-sitter/playground](https://tree-sitter.github.io/tree-sitter/playground)

## LICENSE

Inspired and based on：

- AI-based Coding Editor [Continue](https://github.com/continuedev/continue)
- AI-based conversational search [Bloop](https://github.com/BloopAI/bloop)
- AI-powered coding wizard [AutoDev](https://github.com/unit-mesh/auto-dev)
- TreeSitter-based architecture analysis: [Guarding](https://github.com/modernizing/guarding)

AutoDev VSCode is licensed under the `Apache 2.0` license as defined in [LICENSE](./LICENSE).

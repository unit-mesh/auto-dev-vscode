---
layout: default
title: Home
description: 🧙‍AutoDev - The AI-powered coding wizard with multilingual support 🌐, auto code generation 🏗️, and a helpful bug-slaying assistant 🐞! Customizable prompts 🎨 and a magic Auto Dev/Testing feature 🧪 included! 🚀
nav_order: 1
permalink: /
---

<p align="center">
  <img src="https://plugins.jetbrains.com/files/21520/412905/icon/pluginIcon.svg" width="160px" height="160px" />
</p>
<h1 align="center">AutoDev VSCode</h1>
<p align="center">
    <a href="https://marketplace.visualstudio.com/items?itemName=Phodal.autodev">
        <img src="https://img.shields.io/visual-studio-marketplace/v/Phodal.autodev" alt="Visual Studio Marketplace Version" />
    </a>
    <a href="https://github.com/unit-mesh/auto-dev-vscode/actions/workflows/ci.yml">
        <img src="https://github.com/unit-mesh/auto-dev-vscode/actions/workflows/ci.yml/badge.svg" alt="CI" />
    </a>
    <a href="https://codecov.io/gh/unit-mesh/auto-dev-vscode">
        <img src="https://codecov.io/gh/unit-mesh/auto-dev-vscode/graph/badge.svg?token=2i07qhIqQh" alt="codecov" />
    </a>
</p>

> 🧙‍AutoDev: The AI-powered coding wizard with multilingual support 🌐, auto code generation 🏗️, and a helpful
> bug-slaying assistant 🐞! Customizable prompts 🎨 and a magic Auto Dev/Testing/Document/Agent feature 🧪 included! 🚀

JetBrains' IDE Version: [https://github.com/unit-mesh/auto-dev](https://github.com/unit-mesh/auto-dev)

## Todos

- [ ] Custom LLM config
- [ ] Context Provider
  - [ ] Structurer
    - [ ] UML Render
  - [ ] RelatedCode
  - [ ] SimilarChunk?
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
- [ ] Local embedding
  - [ ] ONNX Runtime
  - [ ] Embedding Database
    - [ ] [LanceDB](https://github.com/lancedb/lancedb) spike
      - [vectordb](https://www.npmjs.com/package/vectordb)
    - [ ] [RocksDB](https://github.com/facebook/rocksdb) spike
- [ ] i18n

## Fine-tuning model

AutoDev fine-tune models:

| name          | model download (HuggingFace)                                    | finetune Notebook                    | model download (OpenBayes)                                                          |
|---------------|-----------------------------------------------------------------|--------------------------------------|-------------------------------------------------------------------------------------|
| DeepSeek 6.7B | [AutoDev Coder](https://huggingface.co/unit-mesh/autodev-coder) | [finetune.ipynb](finetunes/deepseek) | [AutoDev Coder](https://openbayes.com/console/phodal/models/rCmer1KQSgp/9/overview) |

### Language Support (for Fine-tuning)

We follow [Chapi](https://github.com/phodal/chapi) AST analysis engine for language support tier.

| Features                  | Java | Python | Go | Kotlin | JS/TS | C/C++ | C# | Scala | Rust | ArkTS |
|---------------------------|------|--------|----|--------|-------|-------|----|-------|------|-------|
| Chat Language Context     | ✅    | ✅      | ✅  | ✅      | ✅     | ✅     |    |       | ✅    | ✅     | 
| Structure AST             | ✅    |        | ✅  | ✅      | ✅     | ✅     |    |       |      |       | 
| Doc Generation            | ✅    | ✅      | ✅  | ✅      | ✅     |       |    |       | ✅    | ✅     | 
| Precision Test Generation | ✅    | ✅      | ✅  | ✅      | ✅     |       |    |       | ✅    |       | 
| Precision Code Generation | ✅    |        |    | ✅      |       |       |    |       |      |       | 
| AutoCRUD                  | ✅    |        |    | ✅      |       |       |    |       |      |       | 

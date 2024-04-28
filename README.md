<p align="center">
  <img src="media/pluginIcon.png" width="160px" height="160px"  alt="logo" />
</p>
<h1 align="center">AutoDev for VSCode</h1>
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
    - [x] OpenAI Compatible
- [ ] Provider API design
    - [x] ChatContext
    - [x] Structurer
    - [ ] RelatedCode
    - [ ] SimilarChunk?
- [ ] Chat mode
    - [x] Chat UI
    - [ ] Chat with selection
    - [ ] Chat with code
- [ ] Touch Point
    - [X] QuickPick
    - [x] ContextMenu
    - [x] QuickFix
    - [x] CodeLens
    - [x] Terminal
    - [ ] Commit Message for SCM
    - [ ] Fix when error
- [ ] Action by AstNode
    - [x] TreeSitter
        - [x] Class level
        - [x] Method level
        - [x] spike for Variable level, since is not easy to implement
    - [ ] Language Server Protocol
        - [ ] Java
        - [ ] Python
    - [ ] Backend Worker for TreeSitter analysis
- [ ] DevIns language support
    - [ ] Syntax Highlight
    - [ ] Custom command
    - [ ] Input Language
- [ ] Custom prompt
    - [x] Custom prompt settings
    - [x] Custom prompt
        - [x] Align to IDE version
    - [ ] Json Schema validation
- [ ] Custom Agent
    - [ ] Custom Agent
    - [ ] Custom Agent API
- [ ] Local Text Search
    - [ ] TF-IDF
        - [natural](https://naturalnode.github.io/natural/tfidf.html)
    - [ ] Simple Text Embedding
- [ ] Local Semantic Search
    - [ ] ONNX Runtime
    - [ ] Transformer.js
        - [ ] [transformers](https://xenova.github.io/transformers.js/)
    - [ ] Embedding Database
        - [ ] [LanceDB](https://github.com/lancedb/lancedb) spike ?
            - [vectordb](https://www.npmjs.com/package/vectordb) ?
        - [ ] [RocksDB](https://github.com/facebook/rocksdb) spike ?
- [ ] Extensions 
    - [x] Gradle 
    - [ ] Database
    - [ ] Terminal
    - [ ] UI
- [ ] l18n
    -  [x] init

## Resources

- Code search [Sweep](https://github.com/sweepai/sweep)
- TreeSitter [Playground](https://tree-sitter.github.io/tree-sitter/playground)

## LICENSE

Inspired and based on：

- AI-based Coding Editor [Continue](https://github.com/continuedev/continue) for LLM provider and CodeCompletion.
- AI-based conversational search [Bloop](https://github.com/BloopAI/bloop) for indexes and code search.
- AI-powered coding wizard [AutoDev](https://github.com/unit-mesh/auto-dev) for AutoTasking.
- TreeSitter-based architecture analysis: [Guarding](https://github.com/modernizing/guarding)

AutoDev VSCode is licensed under the `Apache 2.0` license as defined in [LICENSE](./LICENSE).

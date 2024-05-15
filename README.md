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

> 🧙‍AutoDev: the AI-powered coding wizard with multilingual support 🌐, auto code generation 🏗️, and a helpful
> bug-slaying assistant 🐞! Customizable prompts 🎨 and a magic Auto Dev/Testing/Document/Agent feature 🧪 included! 🚀

JetBrains' IDE Version: [https://github.com/unit-mesh/auto-dev](https://github.com/unit-mesh/auto-dev)

## Join the Community

<img src="https://unitmesh.cc/images/qrcode.jpg" height="400px" alt="wechat qrcode" />

If you are interested in AutoDev, you can join our WeChat group by scanning the QR code above.

（如果群二维码过期，可以添加我的微信号：`phodal02`，注明 `AutoDev`，我拉你入群）

## Todos

- [ ] Custom LLM config
    - [x] OpenAI Compatible
- [ ] Provider API design
    - [x] LanguageProfile
    - [x] ToolchainContextProvider / ChatContextProvider
    - [x] BuildToolProvider
    - [x] Structurer
    - [x] TestGenProvider
    - [x] RelatedCode
    - [x] SimilarChunk
    - [x] ActionCreator
- [ ] Chat mode
    - [x] Chat UI
    - [x] Chat with selection
- [ ] Touch-point, aka: [Contribution Point](https://code.visualstudio.com/api/references/contribution-points)
    - [X] QuickPick
    - [x] ContextMenu
    - [x] QuickFix
    - [x] CodeLens
    - [x] Terminal
    - [x] Commit Message for SCM
    - [ ] Fix when error
    - [ ] Comments Title: `comments/comment/title`
    - [ ] Fix testings: `testing/message/context`
- [ ] Action by AstNode
    - [x] TreeSitter
        - [x] Class level
        - [x] Method level
        - [x] spike for Variable level, since is not easy to implement
    - [ ] ~~Language Server Protocol~~
        - [ ] ~~Java~~
        - [ ] ~~Python~~
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
    - [x] TF-IDF
        - [natural](https://naturalnode.github.io/natural/tfidf.html)
    - [x] Simple Text Embedding
- [ ] Local Semantic Search
    - [x] ONNX Runtime
    - [x] Transformer.js
        - [x] [transformers](https://xenova.github.io/transformers.js/)
    - [x] Embedding Database
        - [x] [LanceDB](https://github.com/lancedb/lancedb)
        - [x] [vectordb](https://www.npmjs.com/package/vectordb)
    - [x] Semantic Search
- [ ] Extensions
    - [x] Build Tools
        - [x] Gradle
        - [x] Go Mod
        - [x] NPM
        - [x] Toml
    - [ ] Database
    - [ ] Terminal
- [ ] Docs with RAG
    - [ ] spike: Auto Generate doc based on sourcecode
    - [ ] Ask business doc
        - [ ] Markdown
        - [ ] RDF
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
- Static SCA analyser: [ArchGuard](https://github.com/archguard/archguard)
- DevIns parser based
  on [VSCode Markdown](https://github.com/microsoft/vscode/blob/main/extensions/markdown-basics/syntaxes/markdown.tmLanguage.json)

AutoDev VSCode is licensed under the `Apache 2.0` license as defined in [LICENSE](./LICENSE).

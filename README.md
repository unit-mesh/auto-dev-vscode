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

Documentation: [https://vscode.unitmesh.cc/](https://vscode.unitmesh.cc/)

## Join the Community

<img src="https://unitmesh.cc/images/qrcode.jpg" height="400px" alt="wechat qrcode" />

If you are interested in AutoDev, you can join our WeChat group by scanning the QR code above.

（如果群二维码过期，可以添加我的微信号：`phodal02`，注明 `AutoDev`，我拉你入群）

## Roadmap

Normal features

| Feature                | VSCode Status | IDEA Status |
|------------------------|---------------|-------------|
| Chat mode              | ✅             | ✅           |
| Code completion        | ✅             | ✅           |
| AutoDoc                | ✅             | ✅           |
| Custom Prompt          | ✅             | ✅           |
| Prompt Overwrite       | ✅             | ✅           |
| Commit Message         | ✅             | ✅           |
| Gen API Data           | ✅             | ✅           |
| AutoTest               | ✅             | ✅           |
| Refactoring: Rename    | ✅             | ✅           |
| Refactoring: fix       | ✅             | ✅           |
| Refactoring: with Lint | ❌             | ✅           |
| CLI Suggest            | ❌             | ✅           |

Natural Language search features

| Feature                | VSCode Status | IDEA Status |
|------------------------|---------------|-------------|
| Custom RAG             | ✅             | ❌           |
| NL Semantic Search     | ✅             | ❌           |
| Multiple RAG Strategy  | ✅             | ❌           |

DevOps features

| Feature                | VSCode Status | IDEA Status |
|------------------------|---------------|-------------|
| Dockerfile             | ❌             | ✅           |
| CI/CD                  | ❌             | ✅           |

AI Agent features

| Feature                | VSCode Status | IDEA Status |
|------------------------|---------------|-------------|
| AI Agent: DevIns Lang  | ❌             | ✅           |
| AI Agent: Custom Agent | ❌             | ✅           |
| AI Agent: AutoCRUD     | ❌             | ✅           |
| AI Agent: AutoArkUI    | ❌             | ✅           |
| AI Agent: AutoSQL      | ❌             | ✅           |
| AI Agent: AutoPage     | ❌             | ✅           |

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
- Git parser based on [GitLens](https://github.com/gitkraken/vscode-gitlens) with MIT License

AutoDev VSCode is licensed under the `Apache 2.0` license as defined in [LICENSE](./LICENSE).

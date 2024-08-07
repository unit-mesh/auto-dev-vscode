## [0.5.2](https://github.com/unit-mesh/auto-dev-vscode/compare/v0.5.0...v0.5.2) (2024-07-19)


### Bug Fixes

* add simple local test for local version ([ddff9fb](https://github.com/unit-mesh/auto-dev-vscode/commit/ddff9fb87abb7087455980194c9a540c49f36dd8))
* **commandsService:** swap SemanticSearchKeyword and SemanticSearchCode methods ([f87dbc7](https://github.com/unit-mesh/auto-dev-vscode/commit/f87dbc7d126ae0ccfd3cc2f7400c8587c81da4ff))
* **extension:** fix hf local model and remote cache paths ([#64](https://github.com/unit-mesh/auto-dev-vscode/issues/64)) ([1d5c96f](https://github.com/unit-mesh/auto-dev-vscode/commit/1d5c96f0ef3e074743854f6e29e90a16600cc7b8))
* invoke codebase indexing action ([69f35cf](https://github.com/unit-mesh/auto-dev-vscode/commit/69f35cf9fec418b5f67ab66c3751bb1b0c7ca5b7))
* openai end-of-stream output is undefined ([be24963](https://github.com/unit-mesh/auto-dev-vscode/commit/be249634de4a6677069c3b2b27b99aaa3aed19e1))
* support for chat.models override base configuration ([#60](https://github.com/unit-mesh/auto-dev-vscode/issues/60)) ([e2070d4](https://github.com/unit-mesh/auto-dev-vscode/commit/e2070d45cf10b231399e61bec7c8bc926bed6e13))
* version field is not configured ([9ebfe0e](https://github.com/unit-mesh/auto-dev-vscode/commit/9ebfe0e347b0ef6eb72cd137537f42183dd1832e))


### Features

* **chatView:** auto add selected code to chat panel when shortcut  (ctrl + l) or the menu ([c0c97ef](https://github.com/unit-mesh/auto-dev-vscode/commit/c0c97effe7be0a44789ac487b3f886eee1dbceed))
* **code-search:** implement BM25 similarity algorithm ([6a9175c](https://github.com/unit-mesh/auto-dev-vscode/commit/6a9175c21ff656a6447fb5af356cad9adb04fd4b))
* **completion:** Add new language model "codegeex-4" for inline completion ([15a6c80](https://github.com/unit-mesh/auto-dev-vscode/commit/15a6c80093c34d66ba1bf9e18d3b4d9d54c3a31f))
* custom display and sort codelens items ([#57](https://github.com/unit-mesh/auto-dev-vscode/issues/57)) ([e66a4f8](https://github.com/unit-mesh/auto-dev-vscode/commit/e66a4f889be02d4040d5c8962a03c7428c00af4e))
* **embedding:** implement ILanguageModelProvider in LocalEmbeddingsProvider ([a7a1862](https://github.com/unit-mesh/auto-dev-vscode/commit/a7a18629007605b103372967067f46329bab3d9d))
* **llm:** add codegeex-4 model support for chats ([3e8e2d2](https://github.com/unit-mesh/auto-dev-vscode/commit/3e8e2d2f45d38e60cf481f63fed391b2b15ff889))
* **llm:** add glm-4 model support for chats ([c6a92b4](https://github.com/unit-mesh/auto-dev-vscode/commit/c6a92b4285e1f19ff36ec7a80cebc4b281e61176))
* **search:** add removeDocument method to Tfidf class ([9b63fcd](https://github.com/unit-mesh/auto-dev-vscode/commit/9b63fcd7c1f500d3c56325a74ed30f1d5efcf76d))
* support fim special tokens configuration ([#62](https://github.com/unit-mesh/auto-dev-vscode/issues/62)) ([ccc47fb](https://github.com/unit-mesh/auto-dev-vscode/commit/ccc47fb27f93fe3b93d2e67b0209e54de3e0641a))



# [0.5.0](https://github.com/unit-mesh/auto-dev-vscode/compare/v0.3.3...v0.5.0) (2024-06-14)


### Features

* better interactive experience ([#55](https://github.com/unit-mesh/auto-dev-vscode/issues/55)) ([9620fdf](https://github.com/unit-mesh/auto-dev-vscode/commit/9620fdf76b3b4df09b6fd449112f327feb757822))



## [0.3.3](https://github.com/unit-mesh/auto-dev-vscode/compare/v0.3.1...v0.3.3) (2024-06-02)


### Bug Fixes

* fix chat panel without modifier key error ([110a461](https://github.com/unit-mesh/auto-dev-vscode/commit/110a4611b276fe3fa9c864cb5e7112ff6fdc8747))


### Features

* **AutoDevExtension:** show channel before indexing directories ([3d40fe7](https://github.com/unit-mesh/auto-dev-vscode/commit/3d40fe7237f7c5be03f7e5edac8a11917de6347b))
* **code-search:** add GitCommit interface and HistoryBuilder class [#47](https://github.com/unit-mesh/auto-dev-vscode/issues/47) ([6015c76](https://github.com/unit-mesh/auto-dev-vscode/commit/6015c766fab339f2cc6f075a65d50de28b82ae04))
* **code-search:** add TimeTravelTool and BugLooperTool classes [#47](https://github.com/unit-mesh/auto-dev-vscode/issues/47) ([5d2f54b](https://github.com/unit-mesh/auto-dev-vscode/commit/5d2f54bb4058a255a42850d368682d86ef878ba3))
* **code-search:** implement TimeTravelDebugger and refactor history tools [#47](https://github.com/unit-mesh/auto-dev-vscode/issues/47) ([f1e5719](https://github.com/unit-mesh/auto-dev-vscode/commit/f1e5719e55756ab7d297e88d1608d3c1061077a7))
* **commands:** add getInput function to retrieve selected or entire text ([0cc8291](https://github.com/unit-mesh/auto-dev-vscode/commit/0cc82918bbe9572b853b9ce386806acd3193ade2))
* **commands:** localize prompt message in newSessionWithPrompt request [#44](https://github.com/unit-mesh/auto-dev-vscode/issues/44) ([1bee176](https://github.com/unit-mesh/auto-dev-vscode/commit/1bee1769c1ae7880c1c79f3719817891d36e387c))
* **context-provider:** move ContextItem interface to new BaseContextProvider ([0b828af](https://github.com/unit-mesh/auto-dev-vscode/commit/0b828aff2f55241afd4d54fe8518d91071f01f53))
* **editor:** add code selection and insertion functions to PositionUtil ([18d6e70](https://github.com/unit-mesh/auto-dev-vscode/commit/18d6e70b861c8022d68a01081a0a2abc4c3aa142))
* **editor:** add more files to ignore list ([72ec08f](https://github.com/unit-mesh/auto-dev-vscode/commit/72ec08fa1948b2c34907429c7b248d288aeda66a))
* **editor:** add more files to ignore list [#46](https://github.com/unit-mesh/auto-dev-vscode/issues/46) ([6736979](https://github.com/unit-mesh/auto-dev-vscode/commit/6736979960d50bdb734ff3a856c97bf1cf4e5702))
* **editor:** replace old UUID generation with crypto.randomUUID ([cc8e211](https://github.com/unit-mesh/auto-dev-vscode/commit/cc8e211dadf8c448e2d033f95fe04b56c85df764))
* **embedding:** add max chunk size limit and adjust error logging ([920a31d](https://github.com/unit-mesh/auto-dev-vscode/commit/920a31dcf03316164d58d8615c6cc2f5e7c6cee3))
* **embedding:** add re-embedding strategy for failed chunks ([3e14da2](https://github.com/unit-mesh/auto-dev-vscode/commit/3e14da206b3a66dd533819eb3900bbadc267daf4))
* **git:** add IssueIdParser class to parse issue id from commit message [#47](https://github.com/unit-mesh/auto-dev-vscode/issues/47) ([11e0eb8](https://github.com/unit-mesh/auto-dev-vscode/commit/11e0eb88f4a489d91a38944e4d53b7a684a857b8))
* **gui-sidebar:** add new commands to stateSlice and update related files ([a317d11](https://github.com/unit-mesh/auto-dev-vscode/commit/a317d111763c13eadb7ca086007c8e2de86d5c59))
* **gui-sidebar:** add optional codebase context retrieval in input resolution ([88d7757](https://github.com/unit-mesh/auto-dev-vscode/commit/88d77579025a26bce65b3e6bb6a259af62050dbe))
* **gui-sidebar:** add type checking to model selector function ([f9278ed](https://github.com/unit-mesh/auto-dev-vscode/commit/f9278ed1fbda9cce21cd90ed2fb0c51635d86b6d))
* **indexing:** add GitVersionHistoryIndex class with database tables [#47](https://github.com/unit-mesh/auto-dev-vscode/issues/47) ([7bb939d](https://github.com/unit-mesh/auto-dev-vscode/commit/7bb939d301fa33a2b9e13f94487b6664a7567113))
* **l10n:** add localization support to prompts in commands.ts [#44](https://github.com/unit-mesh/auto-dev-vscode/issues/44) ([003106c](https://github.com/unit-mesh/auto-dev-vscode/commit/003106c1182f674ae1d5fb1d5111f2cf48c9e66a))
* **log:** add LogParser module in git log [#47](https://github.com/unit-mesh/auto-dev-vscode/issues/47) ([f33e449](https://github.com/unit-mesh/auto-dev-vscode/commit/f33e4491a2f45444ac5bfbf9fa6a3f86446cbf51))
* **refactor:** add README for refactor-this action ([09e090e](https://github.com/unit-mesh/auto-dev-vscode/commit/09e090e05a9bb662712b7803a1b2c583d176c1e0))
* **sidebar:** add support for codespace keyword and code analysis commands ([2b891de](https://github.com/unit-mesh/auto-dev-vscode/commit/2b891de28126ae31a0ce37cccb6f614deacd05bd))
* **TeamTermService:** add file existence check and error handling ([d0968b5](https://github.com/unit-mesh/auto-dev-vscode/commit/d0968b5aba631afe4822ea9f3bdb7188671e0e84))



## [0.3.1](https://github.com/unit-mesh/auto-dev-vscode/compare/v0.3.0...v0.3.1) (2024-05-24)


### Bug Fixes

* **gui-sidebar:** handle potential null values in defaultModel ([ddc4216](https://github.com/unit-mesh/auto-dev-vscode/commit/ddc42160df44e075be481a0092c8f39523ecd368))


### Features

* **autodev:** enhance quick fix provider and update test file detection ([d5ef1c6](https://github.com/unit-mesh/auto-dev-vscode/commit/d5ef1c638c6f4d56f09da717d422dce44860ed8f))
* Automatically update the chat sidepanel model list when configuration changes are made ([40e2ba5](https://github.com/unit-mesh/auto-dev-vscode/commit/40e2ba5005404ef44454b7427ba1a632b093e1cf))
* Compatible with older chat message formats ([4fd3578](https://github.com/unit-mesh/auto-dev-vscode/commit/4fd3578eb6cae24f987121bb19ffe36c9879299d))
* Run llm in send to webview ([a9ce0f6](https://github.com/unit-mesh/auto-dev-vscode/commit/a9ce0f646ad5efe07b18e5d304fdc8bbcc388546))
* update openai chat models ([7681081](https://github.com/unit-mesh/auto-dev-vscode/commit/7681081a7af0a38bca2f52773d2b2c975b7ac861))
* **vite.config): remove onfeatnxruntime-web(vite.config from:** external remove dependencies onnxruntime-web ([900c727](https://github.com/unit-mesh/auto-dev-vscode/commit/900c727c1158723d4d6a6f9ac88063b39fe9dd3a))



# [0.3.0](https://github.com/unit-mesh/auto-dev-vscode/compare/v0.2.6...v0.3.0) (2024-05-24)


### Bug Fixes

* compatible apiBase ([e3ea70e](https://github.com/unit-mesh/auto-dev-vscode/commit/e3ea70e4e57178e8776606556f27fb5ebff45116))
* **editor-api:** remove comment prefix from change output ([34f5ad6](https://github.com/unit-mesh/auto-dev-vscode/commit/34f5ad6f57fce6898c220e9fac3be3baec1c6bb5))


### Features

* **action:** rearrange refresh method and improve prepareRename readability ([4af9d78](https://github.com/unit-mesh/auto-dev-vscode/commit/4af9d78b6740fc3b3c26ba3a78ae6a10c77a8f6a))
* add code completions ([236b564](https://github.com/unit-mesh/auto-dev-vscode/commit/236b5645392a048d09dc5b95f4b4acc8af8b8c68))
* **AutoDevCodeLensProvider:** implement vscode.Disposable interface [#37](https://github.com/unit-mesh/auto-dev-vscode/issues/37) ([74ce9c7](https://github.com/unit-mesh/auto-dev-vscode/commit/74ce9c7ac7a788df9e13701b28ff5dea13979668))
* **autoDevCommand:** rename Explain to ExplainThis and update prompt message [#37](https://github.com/unit-mesh/auto-dev-vscode/issues/37) ([596f81c](https://github.com/unit-mesh/auto-dev-vscode/commit/596f81c5574f4ce4255dc8a29cae544046d0d7d6))
* **code-lens:** add test lens for classes and methods [#37](https://github.com/unit-mesh/auto-dev-vscode/issues/37) ([822af60](https://github.com/unit-mesh/auto-dev-vscode/commit/822af603f69f14df47e28e22ed8bdec0384261fa))
* **code-search:** add Git change retrieval option [#30](https://github.com/unit-mesh/auto-dev-vscode/issues/30) ([cb89f82](https://github.com/unit-mesh/auto-dev-vscode/commit/cb89f828791287d6822d6bd9543ed74ddb51d1ca))
* **code-search:** add Jaccard similarity for better search results [#30](https://github.com/unit-mesh/auto-dev-vscode/issues/30) ([8a51b88](https://github.com/unit-mesh/auto-dev-vscode/commit/8a51b888e0d62ba565c06b61683fc7e70558c89b))
* **code-search:** enhance search strategies and retrieval methods [#30](https://github.com/unit-mesh/auto-dev-vscode/issues/30) ([17b658e](https://github.com/unit-mesh/auto-dev-vscode/commit/17b658ec818cbba0e663b3fddbe1868f7e413f8a))
* **code-search:** increase history commits limit and add type annotations [#30](https://github.com/unit-mesh/auto-dev-vscode/issues/30) ([0f4359e](https://github.com/unit-mesh/auto-dev-vscode/commit/0f4359e8d5ef9270516b0072afb76671c9148b6c))
* **commands:** add language context to AutoDev commands [#38](https://github.com/unit-mesh/auto-dev-vscode/issues/38) ([71e7d0d](https://github.com/unit-mesh/auto-dev-vscode/commit/71e7d0da63835a72338437889f464f355b67bbea))
* **commands:** replace 'input' with 'prompt' in newSessionWithPrompt request [#38](https://github.com/unit-mesh/auto-dev-vscode/issues/38) ([076ef1b](https://github.com/unit-mesh/auto-dev-vscode/commit/076ef1b7444b7fae1c3bd3a6fcbea85d83f59638))
* **commands:** replace userInput with newSessionWithPrompt in AutoDevCommand ([b60e2d5](https://github.com/unit-mesh/auto-dev-vscode/commit/b60e2d583a7c14737c14429a8140eefcf46a6711))
* **commands:** update FixThis command to handle active editor [#37](https://github.com/unit-mesh/auto-dev-vscode/issues/37) ([c7f3b93](https://github.com/unit-mesh/auto-dev-vscode/commit/c7f3b93f25ebba049b87257ca896499c0e8f4f28))
* **docs:** add basic features documentation ([3c5008c](https://github.com/unit-mesh/auto-dev-vscode/commit/3c5008c86b2176792e1e67e4fa14a9da0d9cacce))
* **domain:** add QueryExpansion class for query expansion [#30](https://github.com/unit-mesh/auto-dev-vscode/issues/30) ([508ea9f](https://github.com/unit-mesh/auto-dev-vscode/commit/508ea9f5ea71afb59335e0470144f074febc4afb))
* **editor-api:** add Git log parsing functionality [#30](https://github.com/unit-mesh/auto-dev-vscode/issues/30) ([2b4e4b6](https://github.com/unit-mesh/auto-dev-vscode/commit/2b4e4b6b77e931b25656bf8701ed9c841f11e768))
* **editor-api:** enhance GitAction class with new methods and improvements [#30](https://github.com/unit-mesh/auto-dev-vscode/issues/30) ([d78ecf4](https://github.com/unit-mesh/auto-dev-vscode/commit/d78ecf427f82b5d4fbdfdcfd86e93d86ed47880c))
* **editor:** add case for history save in AutoDevWebviewProtocol.ts ([7334dcf](https://github.com/unit-mesh/auto-dev-vscode/commit/7334dcf8a847bd8671a26588e518b2c0015c95e7))
* **editor:** enhance TreeSitterFileManager with new methods and imports [#37](https://github.com/unit-mesh/auto-dev-vscode/issues/37) ([5779016](https://github.com/unit-mesh/auto-dev-vscode/commit/57790161718020be5355df8804fabd06331c13bc))
* **editor:** refactor TreeSitterFileManager and related classes [#30](https://github.com/unit-mesh/auto-dev-vscode/issues/30) ([b0b8962](https://github.com/unit-mesh/auto-dev-vscode/commit/b0b8962ac81ef1b4eaf78dc6cec946b655695922))
* **editor:** replace Map with LRUCache in TreeSitterFileManager [#30](https://github.com/unit-mesh/auto-dev-vscode/issues/30) ([34e9069](https://github.com/unit-mesh/auto-dev-vscode/commit/34e90690bb7b99751bb535c5b79011f2ac61ebe1))
* **editor:** update edit params creation in TreeSitterFileManager [#37](https://github.com/unit-mesh/auto-dev-vscode/issues/37) ([ba95e6d](https://github.com/unit-mesh/auto-dev-vscode/commit/ba95e6d2e92925f42cd277ce984de62452fc3a45))
* **editor:** update TreeSitterFileManager and TreeSitterFile [#37](https://github.com/unit-mesh/auto-dev-vscode/issues/37) ([32ea13e](https://github.com/unit-mesh/auto-dev-vscode/commit/32ea13eca640ff3c33bf079b77084b5d05b99eef))
* **embeddings:** add support for multiple provider types [#30](https://github.com/unit-mesh/auto-dev-vscode/issues/30) ([f7d59bd](https://github.com/unit-mesh/auto-dev-vscode/commit/f7d59bd28d0d3901901422015b91a08277e44233))
* **extension:** add openSettings action ([d8626a9](https://github.com/unit-mesh/auto-dev-vscode/commit/d8626a9e7822c087cd0b6391e5da232341b771e7))
* **JaccardSimilarity:** add path similarity method [#30](https://github.com/unit-mesh/auto-dev-vscode/issues/30) ([4e8bdaa](https://github.com/unit-mesh/auto-dev-vscode/commit/4e8bdaacb92a33c3f11310d5340466cb208c0fcd))
* **llm:** update LLMReranker constructor and complete method [#30](https://github.com/unit-mesh/auto-dev-vscode/issues/30) ([0a768e4](https://github.com/unit-mesh/auto-dev-vscode/commit/0a768e43111d2429e668db3a855dd61f20f9a9db))
* **prompt:** add LlmReranker prompt support [#30](https://github.com/unit-mesh/auto-dev-vscode/issues/30) ([f349c26](https://github.com/unit-mesh/auto-dev-vscode/commit/f349c2652ef6ddd116efa7ab1043fff287fc610a))
* **PythonProfile:** add Python language support [#38](https://github.com/unit-mesh/auto-dev-vscode/issues/38) ([c35c536](https://github.com/unit-mesh/auto-dev-vscode/commit/c35c536c2f704095ef4f9da241c0701dbae2e09a))
* **refactor:** move RenameLookupExecutor and add AutoDevRenameProvider ([cf7e195](https://github.com/unit-mesh/auto-dev-vscode/commit/cf7e195abdfc7abd6d6c366bde5e0e9995f22768))
* **reranker:** add LLMReranker for code snippet relevance ([2e15f76](https://github.com/unit-mesh/auto-dev-vscode/commit/2e15f76e5b034371d377dcac43974d49b631b1f5))
* **retrieval:** add git history retrieval functionality [#30](https://github.com/unit-mesh/auto-dev-vscode/issues/30) ([13399fb](https://github.com/unit-mesh/auto-dev-vscode/commit/13399fbe87a1442be7d511b30071413107a219f5))
* **search:** enable commit message search in HydeKeywordsStrategy [#30](https://github.com/unit-mesh/auto-dev-vscode/issues/30) ([94e4f2a](https://github.com/unit-mesh/auto-dev-vscode/commit/94e4f2af617cbce94818f12c7ab4b7e78f653112))
* **search:** implement searchChunks method in TfIdfSemanticChunkSearch ([2333c90](https://github.com/unit-mesh/auto-dev-vscode/commit/2333c90d992c1b1f7c843a27e14ee78e3dbde8a2))
* **search:** replace GitChange with CommitMessageSearch and rename TfIdfSemanticChunkSearch [#30](https://github.com/unit-mesh/auto-dev-vscode/issues/30) ([3e0730d](https://github.com/unit-mesh/auto-dev-vscode/commit/3e0730dabc45b6d16c371295207e0ad56c103eb1))
* **search:** replace natural from sourcecode for size, and add custom stopwords and tokenizer classes ([2e91025](https://github.com/unit-mesh/auto-dev-vscode/commit/2e910251b3f1a5504dd1de87a237a1920dacd3d4))
* support for code-completion request delay and legacy mode ([61624ec](https://github.com/unit-mesh/auto-dev-vscode/commit/61624ecdc97f48f479677327e4836c721cf0971c))
* **team-terms:** add new terms and improve service [#30](https://github.com/unit-mesh/auto-dev-vscode/issues/30) ([256d2b6](https://github.com/unit-mesh/auto-dev-vscode/commit/256d2b6f6d918a93f3730822d3a0ac38678bbb87))
* **team:** add support for custom team terms [#30](https://github.com/unit-mesh/auto-dev-vscode/issues/30) ([e20d160](https://github.com/unit-mesh/auto-dev-vscode/commit/e20d160c087354bbf9f999a32fbcf8a70a541052))
* **test-generation:** add Python test generation provider [#38](https://github.com/unit-mesh/auto-dev-vscode/issues/38) ([e3ffa72](https://github.com/unit-mesh/auto-dev-vscode/commit/e3ffa72c6161554aa0c7b8236ddb86f65cf464d0))


### Reverts

* Revert "refactor(action): update identifierRange to blockRange in CodeActionCreator" ([9707b6f](https://github.com/unit-mesh/auto-dev-vscode/commit/9707b6f8e83f5a44df27f2c78b0b08458600fe8e))



## [0.2.6](https://github.com/unit-mesh/auto-dev-vscode/compare/v0.2.5...v0.2.6) (2024-05-20)


### Bug Fixes

* **build:** simplify pre-download script and update .vscodeignore ([13812aa](https://github.com/unit-mesh/auto-dev-vscode/commit/13812aaccaa669aa1a60988f83f791ae610fe610))
* **code-search:** handle empty code snippets gracefully [#30](https://github.com/unit-mesh/auto-dev-vscode/issues/30) ([ddc0d9d](https://github.com/unit-mesh/auto-dev-vscode/commit/ddc0d9dbe9e8b3b4740f809674dee5f29a7f419f))
* **editor:** handle empty ranges in AutoDevCodeActionProvider [#30](https://github.com/unit-mesh/auto-dev-vscode/issues/30) ([9b85a5c](https://github.com/unit-mesh/auto-dev-vscode/commit/9b85a5c80d916ce51553c9bc0c5a240a4bf640f6))


### Features

* **autoDev:** add GUI focus input command [#30](https://github.com/unit-mesh/auto-dev-vscode/issues/30) ([2916f14](https://github.com/unit-mesh/auto-dev-vscode/commit/2916f144c08541c32e9f5f4077af02f8ec70e6f3))
* **commands:** add support for new session creation [#30](https://github.com/unit-mesh/auto-dev-vscode/issues/30) ([4ab97ac](https://github.com/unit-mesh/auto-dev-vscode/commit/4ab97ac3ea1f37e42a7df1550842edd0d262870d))
* **embedding:** add session check before initialization [#30](https://github.com/unit-mesh/auto-dev-vscode/issues/30) ([2c133af](https://github.com/unit-mesh/auto-dev-vscode/commit/2c133af4746d5f5ee4d19c565a9dbd290d583d64))
* **tutorial:** add AutoDev tutorial file and showTutorial command ([a50f1dd](https://github.com/unit-mesh/auto-dev-vscode/commit/a50f1dd1e076aaa8795a59741b0d4fc5178490a7))



## [0.2.5](https://github.com/unit-mesh/auto-dev-vscode/compare/v0.2.4...v0.2.5) (2024-05-20)


### Features

* **code-context:** add TextRange support for code snippets retrieval [#30](https://github.com/unit-mesh/auto-dev-vscode/issues/30) ([d7e7647](https://github.com/unit-mesh/auto-dev-vscode/commit/d7e7647a1c0f72c7ee4a8105256c2709fb349df1))
* **code-search:** add support for specifying text ranges in search results [#30](https://github.com/unit-mesh/auto-dev-vscode/issues/30) ([ff6c907](https://github.com/unit-mesh/auto-dev-vscode/commit/ff6c9070eb00da48fd21b8eb53b4eae7d96cffb7))
* **editor:** add error popup with show logs option [#20](https://github.com/unit-mesh/auto-dev-vscode/issues/20) ([ec8910d](https://github.com/unit-mesh/auto-dev-vscode/commit/ec8910db99bf0ec32ba15b18f85387e106c539ec))
* **embedding:** add NamedChunk creation for code chunks [#30](https://github.com/unit-mesh/auto-dev-vscode/issues/30) ([017a539](https://github.com/unit-mesh/auto-dev-vscode/commit/017a539be3a694933668a945a0a268bbadd60163))
* **embedding:** add support for named elements in chunk items [#30](https://github.com/unit-mesh/auto-dev-vscode/issues/30) ([f1d2b27](https://github.com/unit-mesh/auto-dev-vscode/commit/f1d2b277dee2ce6bc0b8c08067250c8c3cba1d82))
* **prompt:** add chat context to propose context [#30](https://github.com/unit-mesh/auto-dev-vscode/issues/30) ([147075b](https://github.com/unit-mesh/auto-dev-vscode/commit/147075b07d5b37c3fbb2eec6f93e40ad06721ec0))
* **redux:** add custom OpenAI compatible model support ([8668f01](https://github.com/unit-mesh/auto-dev-vscode/commit/8668f01d97e9079258ee7153a05164e052ddb75c))



## [0.2.4](https://github.com/unit-mesh/auto-dev-vscode/compare/v0.2.3...v0.2.4) (2024-05-18)


### Bug Fixes

* **code-search:** improve error message handling [#30](https://github.com/unit-mesh/auto-dev-vscode/issues/30) ([ca37823](https://github.com/unit-mesh/auto-dev-vscode/commit/ca3782318cae1c7bee5c74af02183df4bfe7a125))


### Features

* **code-search:** enable full text search and update file paths [#30](https://github.com/unit-mesh/auto-dev-vscode/issues/30) ([358c61c](https://github.com/unit-mesh/auto-dev-vscode/commit/358c61cd03205b84a7a8080d702899f96b888b9f))
* **embedding:** add mergedTensor function for tensor merging [#30](https://github.com/unit-mesh/auto-dev-vscode/issues/30) ([a7b7743](https://github.com/unit-mesh/auto-dev-vscode/commit/a7b77434dcb2ffb879b187b0aca109ab6c9227fd))
* **embedding:** add OllamaEmbeddingsProvider [#30](https://github.com/unit-mesh/auto-dev-vscode/issues/30) ([2e7e6c5](https://github.com/unit-mesh/auto-dev-vscode/commit/2e7e6c56d34cdd61ca709942324b69a9a5f68166))



## [0.2.3](https://github.com/unit-mesh/auto-dev-vscode/compare/v0.2.2...v0.2.3) (2024-05-17)


### Bug Fixes

* fix error path issue ([628ad1b](https://github.com/unit-mesh/auto-dev-vscode/commit/628ad1b3a4d411c086f9d48c8ea5b710df52cf87))
* openai chat model configuration ([397cc68](https://github.com/unit-mesh/auto-dev-vscode/commit/397cc68d5b71248b474d64e8caafb51b108c75b3))


### Features

* add ollama chat server example ([a01098f](https://github.com/unit-mesh/auto-dev-vscode/commit/a01098fc9b7bde45156c5d8598184572073ceb64))
* **code-search:** add language parameter to retrieval and search [#30](https://github.com/unit-mesh/auto-dev-vscode/issues/30) ([b7e7254](https://github.com/unit-mesh/auto-dev-vscode/commit/b7e7254d89e0482821db5f5484e245084bd50a18))
* **code-search:** add logging for keywords and chunks [#30](https://github.com/unit-mesh/auto-dev-vscode/issues/30) ([940cb96](https://github.com/unit-mesh/auto-dev-vscode/commit/940cb967c726212463d30fdd6ea9ce00518cf530))
* **code-search:** add minimum score filter to search results [#30](https://github.com/unit-mesh/auto-dev-vscode/issues/30) ([7c7f46c](https://github.com/unit-mesh/auto-dev-vscode/commit/7c7f46cf37c9b6a07ff13ce2787bc6ccb1c105b8))
* **code-search:** add support for text ranges in code search [#30](https://github.com/unit-mesh/auto-dev-vscode/issues/30) ([193bd4c](https://github.com/unit-mesh/auto-dev-vscode/commit/193bd4c65ffbaee54d4617003f4bdbe0228b94b5))
* **code-search:** add support for Tree-sitter language tags [#30](https://github.com/unit-mesh/auto-dev-vscode/issues/30) ([cc11fe8](https://github.com/unit-mesh/auto-dev-vscode/commit/cc11fe8f923c0671ea338a02532ee24f44d39982))
* **docs:** add Toml support to README.md ([2509063](https://github.com/unit-mesh/auto-dev-vscode/commit/2509063661acd27fb761327ae3d5be93814d033c))
* **editor:** add channel logging for AutoDocActionExecutor ([734cd49](https://github.com/unit-mesh/auto-dev-vscode/commit/734cd498c21529713b2a3b66fef880ad0dc22b22))
* **genius:** add code search assistant functionality [#30](https://github.com/unit-mesh/auto-dev-vscode/issues/30) ([f292050](https://github.com/unit-mesh/auto-dev-vscode/commit/f292050b09ad1a53c2d5abbc347121ec40322698))
* **llm-provider:** add support for dynamic strategy ([bac95ce](https://github.com/unit-mesh/auto-dev-vscode/commit/bac95ce4cf053a777a8cf9257021495b94195f13))
* **llm:** add LLM strategy options for code and chat completion [#30](https://github.com/unit-mesh/auto-dev-vscode/issues/30) ([62acbe1](https://github.com/unit-mesh/auto-dev-vscode/commit/62acbe1b3c0337d493feab6962b3ae24f23b2ae6))
* **parser:** add support for Kotlin language [#30](https://github.com/unit-mesh/auto-dev-vscode/issues/30) ([4615ea5](https://github.com/unit-mesh/auto-dev-vscode/commit/4615ea53f11200f79af2256b333a89e4fa511ac9))
* **prompts:** add code snippet response for code search engine query [#30](https://github.com/unit-mesh/auto-dev-vscode/issues/30) ([96c65ea](https://github.com/unit-mesh/auto-dev-vscode/commit/96c65ea0a28f15934ca5dae789a106903077edaa))
* **search:** add support for Hypothetical Document Embedding (HyDE) [#30](https://github.com/unit-mesh/auto-dev-vscode/issues/30) ([c1c6942](https://github.com/unit-mesh/auto-dev-vscode/commit/c1c6942dde50025a865264b4a7e73e87e5e9638b))


### Reverts

* revert to pass for CI ([61b8244](https://github.com/unit-mesh/auto-dev-vscode/commit/61b8244ad8394f1f6bdf33b6ec30dd18c65a766a))



## [0.2.2](https://github.com/unit-mesh/auto-dev-vscode/compare/v0.2.1...v0.2.2) (2024-05-14)


### Bug Fixes

* **retrieval:** refactor retrieveContextItems function [#30](https://github.com/unit-mesh/auto-dev-vscode/issues/30) ([ae6b941](https://github.com/unit-mesh/auto-dev-vscode/commit/ae6b9417dc4baaf71e25bcb6e7c03ddfbb76c76f))


### Features

* **agent:** add Catalyser class for semantic code search [#30](https://github.com/unit-mesh/auto-dev-vscode/issues/30) ([50c5f53](https://github.com/unit-mesh/auto-dev-vscode/commit/50c5f535987139df06eb185ed601a9abdc42fb41))
* **agent:** refactor custom agent classes into separate files ([9e5c80f](https://github.com/unit-mesh/auto-dev-vscode/commit/9e5c80f6b4aaeac08dc91fa5f3d8e3f374797d03))
* **code-context:** refactor CodeCorrector and TestTemplateManager ([2be8140](https://github.com/unit-mesh/auto-dev-vscode/commit/2be81403e697d509d1afef48ef2afa8e7abfbd7f))
* **code-context:** refactor relatedClassesContext method ([b21b85e](https://github.com/unit-mesh/auto-dev-vscode/commit/b21b85e4b4dfe2578dcebe2eecb294d1950a6a4c))
* **extension:** add user input request to sidebar webview [#30](https://github.com/unit-mesh/auto-dev-vscode/issues/30) ([0c04ce8](https://github.com/unit-mesh/auto-dev-vscode/commit/0c04ce83469cba16e42506e222fbb33b8933bc2c))
* **prompt:** add evaluation step to prompt processing [#30](https://github.com/unit-mesh/auto-dev-vscode/issues/30) ([b440e3f](https://github.com/unit-mesh/auto-dev-vscode/commit/b440e3f09d152c17dbd4e2d53a78ae7c6c257504))
* Remove unused file ([979b293](https://github.com/unit-mesh/auto-dev-vscode/commit/979b29306c77abb4e51549782c192e645c60709e))



## [0.2.1](https://github.com/unit-mesh/auto-dev-vscode/compare/v0.2.0...v0.2.1) (2024-05-13)


### Features

* **java-utils:** filter out Java and Spring framework imports and handle file parsing errors ([11bd4e9](https://github.com/unit-mesh/auto-dev-vscode/commit/11bd4e9779340451202009546e6a7e2ecd003810))
* **java:** add file existence check before parsing ([d530ad6](https://github.com/unit-mesh/auto-dev-vscode/commit/d530ad67df0270294f8fea4411d1d5b448506f3c))



# [0.2.0](https://github.com/unit-mesh/auto-dev-vscode/compare/v0.1.2...v0.2.0) (2024-05-13)


### Bug Fixes

* **code-search:** handle null embeddingsProvider in LanceDbIndex [#22](https://github.com/unit-mesh/auto-dev-vscode/issues/22) ([da03aa7](https://github.com/unit-mesh/auto-dev-vscode/commit/da03aa7e66b4f0e0ec0b673b43b050e1cef349c8))
* fix typos ([d7613a6](https://github.com/unit-mesh/auto-dev-vscode/commit/d7613a6d1e1c2ee5203d8865059ed3a9fd6660d7))
* fix version for ci ([0eaaea5](https://github.com/unit-mesh/auto-dev-vscode/commit/0eaaea563693a6373a8c0aa3136b7eab4c847708))


### Features

* **ast:** add fromParser method in TreeSitterFile class ([28945cc](https://github.com/unit-mesh/auto-dev-vscode/commit/28945ccc3029cc3df9c1b12ef3a61c477f6b7daf))
* **AutoDevExtension:** add dynamic basepath for model loading [#22](https://github.com/unit-mesh/auto-dev-vscode/issues/22) ([6430fbe](https://github.com/unit-mesh/auto-dev-vscode/commit/6430fbeda537f4107da976a3a3889ac9ead98a18))
* **build:** add pre-download-build script for binaries ([0962b36](https://github.com/unit-mesh/auto-dev-vscode/commit/0962b3694855dc31696393327e13bab9d3e31a79))
* **build:** add support for multiple platforms in pre-download-build.js [#22](https://github.com/unit-mesh/auto-dev-vscode/issues/22) ([b886731](https://github.com/unit-mesh/auto-dev-vscode/commit/b886731cfa84bafd806d867b902a20f9e4079609))
* **code-search:** add FullTextSearch class and update import statements [#22](https://github.com/unit-mesh/auto-dev-vscode/issues/22) ([5f3378c](https://github.com/unit-mesh/auto-dev-vscode/commit/5f3378c7aac885e956db7cc1be6e54fb7271bc5a))
* **code-search:** add Reranker interface [#22](https://github.com/unit-mesh/auto-dev-vscode/issues/22) ([f53967f](https://github.com/unit-mesh/auto-dev-vscode/commit/f53967f4ec073fdfb99b051a65d9623e06189ffd))
* **code-search:** add retrieve function to LanceDbIndex [#22](https://github.com/unit-mesh/auto-dev-vscode/issues/22) ([8c11330](https://github.com/unit-mesh/auto-dev-vscode/commit/8c1133032b2d39c75433f6d949bb9e23626b8c39))
* **code-search:** disable codebase indexing methods ([01dc92f](https://github.com/unit-mesh/auto-dev-vscode/commit/01dc92f92205fbf376bd1eba4668820986192210))
* **code-search:** enhance indexing process and add global cache [#22](https://github.com/unit-mesh/auto-dev-vscode/issues/22) ([6bec659](https://github.com/unit-mesh/auto-dev-vscode/commit/6bec6596a8c1c9ea3c791db09351c097b45925ab))
* **code-search:** implement code snippets indexing and retrieval [#22](https://github.com/unit-mesh/auto-dev-vscode/issues/22) ([2f64041](https://github.com/unit-mesh/auto-dev-vscode/commit/2f640413769f70a79ea40aea99959d83773937bc))
* **code-search:** implement full-text search and retrieval functionality [#22](https://github.com/unit-mesh/auto-dev-vscode/issues/22) ([6c81b4b](https://github.com/unit-mesh/auto-dev-vscode/commit/6c81b4bb550e5bd0eeda98b2b9eda4f24d98d700))
* **code-search:** improve logging and specific package version installation [#22](https://github.com/unit-mesh/auto-dev-vscode/issues/22) ([3cf4390](https://github.com/unit-mesh/auto-dev-vscode/commit/3cf4390a77f979a2f537910b99807493f8f3cc1f))
* **codebase-indexer:** add support for LanceDbIndex and improve indexing [#22](https://github.com/unit-mesh/auto-dev-vscode/issues/22) ([cd77bba](https://github.com/unit-mesh/auto-dev-vscode/commit/cd77bba64febabe9acda5ce948ad2295d79a334d))
* **codemodel:** add StructureType enum and update structurers ([fe313ef](https://github.com/unit-mesh/auto-dev-vscode/commit/fe313ef9c80ea13bf6694955b99bb13944c92b00))
* **commands:** use singleton for RelevantCodeProviderManager ([c03a5aa](https://github.com/unit-mesh/auto-dev-vscode/commit/c03a5aad10b6d5d18f9801500d23de181f78b8c4))
* **database:** add SqliteDb class and integrate with AutoDevExtension [#22](https://github.com/unit-mesh/auto-dev-vscode/issues/22) ([4b6bfcf](https://github.com/unit-mesh/auto-dev-vscode/commit/4b6bfcf68e77c427a03c02f62d8930c5ee8bde86))
* **editor:** add language support to Markdown code block parsing ([d257485](https://github.com/unit-mesh/auto-dev-vscode/commit/d2574850d4e493d868c288842f57c10c680f8f65))
* **editor:** add selectionToNode function and update language map [#22](https://github.com/unit-mesh/auto-dev-vscode/issues/22) ([a5030f4](https://github.com/unit-mesh/auto-dev-vscode/commit/a5030f4997f3e7ef8e2959689da47357c76af4bb))
* **editor:** implement indexing action in SystemActionService ([44c4577](https://github.com/unit-mesh/auto-dev-vscode/commit/44c4577b7d9d5ebc69464aaff4ffd5afbac8ef0c))
* **embedding:** add tensorData function and update tensor handling [#22](https://github.com/unit-mesh/auto-dev-vscode/issues/22) ([02105d4](https://github.com/unit-mesh/auto-dev-vscode/commit/02105d4e72e71611ab23e994e50b63a4892c4c43))
* fix binary file path fails in bundler ([4760b90](https://github.com/unit-mesh/auto-dev-vscode/commit/4760b906226ac1228cd4fbee6dc47d6728df08b6))
* **gitignore:** add vite config and changelog to ignore files ([5ab2db3](https://github.com/unit-mesh/auto-dev-vscode/commit/5ab2db3cf8cbab4f3d8c2db7a7e200c03155f4d5))
* **indexing:** add detailed comments and logging for indexing process ([d675526](https://github.com/unit-mesh/auto-dev-vscode/commit/d6755261dfcbb2fdfd2b90894aae98abe91f528e))
* **indexing:** add SQLite caching to LanceDbIndex [#22](https://github.com/unit-mesh/auto-dev-vscode/issues/22) ([312d6ff](https://github.com/unit-mesh/auto-dev-vscode/commit/312d6ffed5e48eb14f3a9032f90660562adbe5f4))
* **indexing:** add webpage crawling and article chunking ([0bd70ad](https://github.com/unit-mesh/auto-dev-vscode/commit/0bd70ad8f5e8fdade1a34e9721d3b7ac7ae87c35))
* **indexing:** refactor codebase indexing process [#22](https://github.com/unit-mesh/auto-dev-vscode/issues/22) ([5d54257](https://github.com/unit-mesh/auto-dev-vscode/commit/5d54257a862f20b8f67b5cfeb2639c138ca30c87))
* **indexing:** refactor indexing process and improve code organization [#22](https://github.com/unit-mesh/auto-dev-vscode/issues/22) ([a0bea09](https://github.com/unit-mesh/auto-dev-vscode/commit/a0bea09c748dcc948b3468e1a71a3a8b6ec2d9eb))
* **javascript:** add support for more JS frameworks ([96107b9](https://github.com/unit-mesh/auto-dev-vscode/commit/96107b935fdbe1c0285d8924c2b3017b0424e82b))
* **markdown:** add multiLineCodeBlock method in StreamingMarkdownCodeBlock ([065239b](https://github.com/unit-mesh/auto-dev-vscode/commit/065239b051028fe554bf01b30ab682f49169489f))
* **markdown:** add StandardCodeBlock class and update StreamingMarkdownCodeBlock ([1cc6617](https://github.com/unit-mesh/auto-dev-vscode/commit/1cc6617f19fc16cbcdd306f3f2864cd31811c354))
* **markdown:** improve code block parsing and filtering ([8df5411](https://github.com/unit-mesh/auto-dev-vscode/commit/8df541160f27d3294b17f4410f7497bdb7038eb8))
* **structurer-provider:** add init method and refactor TypeScriptStructurer ([4ea9e07](https://github.com/unit-mesh/auto-dev-vscode/commit/4ea9e07ed99470cf751d02138bda45866373e036))
* **test-gen:** add language context to Markdown code blocks ([a4c1034](https://github.com/unit-mesh/auto-dev-vscode/commit/a4c103499d55310922b0916c8009eb0935c685aa))
* **typescript:** enable interface declarations and named functions ([14a19c2](https://github.com/unit-mesh/auto-dev-vscode/commit/14a19c2e7dd509b033d73e7dbc10fa8bc7bcefda))
* **typescript:** enhance TypeScript structuring and add tests ([4ff2a98](https://github.com/unit-mesh/auto-dev-vscode/commit/4ff2a98aada2da07ac546f68ec10fa9e31e68885))
* **vite.config:** add node polyfills and update dependencies [#22](https://github.com/unit-mesh/auto-dev-vscode/issues/22) ([d12edfb](https://github.com/unit-mesh/auto-dev-vscode/commit/d12edfb03e91743d28d7b01cf638434b429f95ba))
* **vite.config:** add vectordb to external dependencies ([2d97882](https://github.com/unit-mesh/auto-dev-vscode/commit/2d978825ffa4c1f1e009bd6104a38cf5b527fe14))
* **vite.config:** update dependencies in externalizeDeps plugin ([6f74f22](https://github.com/unit-mesh/auto-dev-vscode/commit/6f74f226557b593e68e8c4c2bd848bd295103ece))



## [0.1.2](https://github.com/unit-mesh/auto-dev-vscode/compare/v0.1.1...v0.1.2) (2024-05-08)


### Bug Fixes

* fix gen icon lost items issues ([dd5fcef](https://github.com/unit-mesh/auto-dev-vscode/commit/dd5fcef75af30bcd9b9f42c88c3a4d14f498d879))


### Features

* **code-context:** add isTestFile method to LanguageProfile ([30e7413](https://github.com/unit-mesh/auto-dev-vscode/commit/30e74135e902081ffee8d38c6feea401f7987832))
* **code-search:** add HydeSteps and update PromptManager methods ([672b9e3](https://github.com/unit-mesh/auto-dev-vscode/commit/672b9e33ad06581dd8aad4b9e99945a1ba05c469))
* **code-search:** add HydeStrategy and HydeDocument classes [#22](https://github.com/unit-mesh/auto-dev-vscode/issues/22) ([679aad4](https://github.com/unit-mesh/auto-dev-vscode/commit/679aad4aaf4f76fa4022c34741bd2e33ab484a3c))
* **code-search:** refactor keyword parsing and add tests [#22](https://github.com/unit-mesh/auto-dev-vscode/issues/22) ([62bc2ee](https://github.com/unit-mesh/auto-dev-vscode/commit/62bc2eebe9370d56865ffa176ce19813cbc430f9))
* **code-search:** remove java schema from structurer ([298acca](https://github.com/unit-mesh/auto-dev-vscode/commit/298acca35b182bf2d075cbd364a5960b677c56ba))
* **commit-message:** add commit message generation functionality ([496603b](https://github.com/unit-mesh/auto-dev-vscode/commit/496603baeabf3b2a3b31ff9034761d56192366d2))
* **diff-manager:** add git diff parsing functionality ([d4762a7](https://github.com/unit-mesh/auto-dev-vscode/commit/d4762a7a1cff770cf3c866609ff0534338ea98f2))
* **editor:** add rename action registration ([5f24b12](https://github.com/unit-mesh/auto-dev-vscode/commit/5f24b121721f1500728c37b9acd5ad5b149a546d))
* **editor:** add rename lookup and refactor prompt manager ([5b7dfdc](https://github.com/unit-mesh/auto-dev-vscode/commit/5b7dfdcaec15a9e08b69bf713066640fe9d1de9e))
* **editor:** handle empty file case in AutoTestActionExecutor ([12ccedc](https://github.com/unit-mesh/auto-dev-vscode/commit/12ccedcc4daaffb6f8217d4c1abb47263e3b605f))
* **editor:** improve rename lookup functionality ([ff0f95d](https://github.com/unit-mesh/auto-dev-vscode/commit/ff0f95d322a8b6d5454ff408eebe057dedcceab9))
* **extension:** add dynamic configuration change support for rename action ([7b61275](https://github.com/unit-mesh/auto-dev-vscode/commit/7b61275b5281ec41a5bc41e8cbfede3da2b17391))
* **git:** init Git types and commit message generator ([077b921](https://github.com/unit-mesh/auto-dev-vscode/commit/077b921c34948cfcdc0c4b49fc277b45d44e602a))
* **scope-graph:** add language profile and symbol handling ([830dcf3](https://github.com/unit-mesh/auto-dev-vscode/commit/830dcf3058914922ec6c6fad72782784eece66b8))
* **search-strategy:** add async instruction method and template context ([dea67a1](https://github.com/unit-mesh/auto-dev-vscode/commit/dea67a1ce6fcfb9091552f6ef139e1a3eb76d710))
* **search-strategy:** add parseKeywords method and update comments ([4c3e3d6](https://github.com/unit-mesh/auto-dev-vscode/commit/4c3e3d675434e27304512e6a91b1f2d379dbcb9f))
* **search-strategy:** convert synchronous methods to async and add chat support [#24](https://github.com/unit-mesh/auto-dev-vscode/issues/24) ([a6debfa](https://github.com/unit-mesh/auto-dev-vscode/commit/a6debfa710769c1ba8242ba38ec930fc9da04ddf))
* **settings:** add enableRename setting in SettingService ([64c2ba4](https://github.com/unit-mesh/auto-dev-vscode/commit/64c2ba4c68f049434e8b6585b2050ae81a25dc75))
* **settings:** enable rename suggestion in settings ([2c462ce](https://github.com/unit-mesh/auto-dev-vscode/commit/2c462cee2fa7cd98ac2a7a9d343ffbeca5006e73))
* **settings:** update configuration retrieval in SettingService ([f8a6c16](https://github.com/unit-mesh/auto-dev-vscode/commit/f8a6c169c6da02dcc5793ed2974b6eac7be4b15c))
* **typescript:** add support for export statement in TypeScriptProfile.ts ([a582274](https://github.com/unit-mesh/auto-dev-vscode/commit/a58227457f1d3f3d46ead484d6b17694d8a2a69b))



## [0.1.1](https://github.com/unit-mesh/auto-dev-vscode/compare/v0.1.0...v0.1.1) (2024-05-07)


### Bug Fixes

* **editor:** ensure postProcessCodeFix is awaited ([0f019cd](https://github.com/unit-mesh/auto-dev-vscode/commit/0f019cd9165b28fa89ae3348e13da563628741ce))
* fix tets ([716f96f](https://github.com/unit-mesh/auto-dev-vscode/commit/716f96fbac36c6dbd33eb200f9e004b8ccc389e3))


### Features

* **ast:** add textToTreeSitterFile function and update JavaTestGenProvider ([337801f](https://github.com/unit-mesh/auto-dev-vscode/commit/337801f16d6724baf0a1b186bc4b272a9c478f3f))
* **BaseStructurerProvider:** add init method and move logic from child classes [#24](https://github.com/unit-mesh/auto-dev-vscode/issues/24) ([02ad3eb](https://github.com/unit-mesh/auto-dev-vscode/commit/02ad3ebad76d7a18b9a8a25118ea4beb4f713a78))
* **BaseStructurerProvider:** add methods for import retrieval and class merging ([a69427f](https://github.com/unit-mesh/auto-dev-vscode/commit/a69427f34f2d0d7039d87a660edf04f46df87f68))
* **code-context:** init Go language support in StructurerProvider [#24](https://github.com/unit-mesh/auto-dev-vscode/issues/24) ([383da8a](https://github.com/unit-mesh/auto-dev-vscode/commit/383da8a7e686587374c02d512733345146eb8f2b))
* **code-context:** refactor BaseStructurer and RelatedCodeProvider ([d566cac](https://github.com/unit-mesh/auto-dev-vscode/commit/d566cac1b5bdb4432e1cb1c1e30e7c6681073fe5))
* **code-context:** refactor RelatedCodeProvider to use singleton pattern and improve language setup ([f194d86](https://github.com/unit-mesh/auto-dev-vscode/commit/f194d86d5eb20973290de467f798b2dbc1b546d0))
* **code-search:** support interpreted string literals in scope graph [#24](https://github.com/unit-mesh/auto-dev-vscode/issues/24) ([c59cd33](https://github.com/unit-mesh/auto-dev-vscode/commit/c59cd336b852c805c239b1e673222c9e975846f8))
* **codemodel:** add class rendering and update test generation ([d9debf3](https://github.com/unit-mesh/auto-dev-vscode/commit/d9debf3159e38e468c9e3cb76967ef05a7c58bef))
* **commands:** refactor commands into separate files ([b1a6b78](https://github.com/unit-mesh/auto-dev-vscode/commit/b1a6b782b9ce921363c7aa91be35a3f0343da240))
* **commands:** refactor commands to use enum and improve readability ([c7509fd](https://github.com/unit-mesh/auto-dev-vscode/commit/c7509fd3da492bac1cbded2fb1edb569adfdd1dd))
* **editor:** add navigation to test file and output writing ([d844dfb](https://github.com/unit-mesh/auto-dev-vscode/commit/d844dfb29803d72fb737666ff07de9c6ad5cc1a3))
* **editor:** add test file detection and handling ([be5096a](https://github.com/unit-mesh/auto-dev-vscode/commit/be5096aa92b678f8924c7a406c2c82fe2b1ecf20))
* **editor:** bind document changes in RecentlyDocumentManager ([c139f56](https://github.com/unit-mesh/auto-dev-vscode/commit/c139f56b30c9de04443c95ac98a42071fd3c51b0))
* **editor:** refactor TreeSitterFileCacheManager to TreeSitterFileManager ([f92c6f4](https://github.com/unit-mesh/auto-dev-vscode/commit/f92c6f4d2eadf85ff0dcc9a9e2e60f8ca77db1c6))
* **editor:** replace writeFile with applyEdit in AutoTestActionExecutor ([bd91f4e](https://github.com/unit-mesh/auto-dev-vscode/commit/bd91f4ee679d5803728fe7b186b122229b3453d2))
* **go:** enhance Go language parsing and structuring [#24](https://github.com/unit-mesh/auto-dev-vscode/issues/24) ([405b935](https://github.com/unit-mesh/auto-dev-vscode/commit/405b935133fe0dfa657104c8fb4f524817f9c0f9))
* **gradle:** add logging and dependency check in GradleBuildToolProvider ([1950637](https://github.com/unit-mesh/auto-dev-vscode/commit/19506372db7518ab6d7e2638f651ebbe0ca2d673))
* **java-utils:** apply edits immediately in JavaCodeCorrector ([06933a8](https://github.com/unit-mesh/auto-dev-vscode/commit/06933a8c5ab0dd9cf01a21d08a5087dae170b58f))
* **java:** improve package handling and filename extraction ([8c03e44](https://github.com/unit-mesh/auto-dev-vscode/commit/8c03e4492ab4adf3b35d2e9562dcecf923a24376))
* **java:** refactor code correction into separate class ([6e120f2](https://github.com/unit-mesh/auto-dev-vscode/commit/6e120f21c61fd174c6693c9c6b304e15b34a0248))
* **JavaTestGenProvider:** add methods to fix incorrect class and package names ([7a29f8e](https://github.com/unit-mesh/auto-dev-vscode/commit/7a29f8ee4675fb184ea530b2af53571cd4e67bda))
* **language-profile:** implement dependency injection for language profiles ([dcda37f](https://github.com/unit-mesh/auto-dev-vscode/commit/dcda37f61dc0063b36e3b3517ea2f99d8c66db67))
* **RelevantCodeProviderManager:** add relatedClassesContext method [#24](https://github.com/unit-mesh/auto-dev-vscode/issues/24) ([4f9f718](https://github.com/unit-mesh/auto-dev-vscode/commit/4f9f71872e99c0bf01f6af580ed59c8b17d91bfc))
* **services:** refactor services and improve dependency injection ([a9341f5](https://github.com/unit-mesh/auto-dev-vscode/commit/a9341f557f3d1bf53eda8dde91729775eb78ef13))
* **test-generation:** add fix for lost package name in Java test generation ([d7401f6](https://github.com/unit-mesh/auto-dev-vscode/commit/d7401f603156709ab51602fed9edb974abdc4b8f))
* **test-generation:** add source code to TypeScriptTestGenProvider and handle empty toolchain ([f86170d](https://github.com/unit-mesh/auto-dev-vscode/commit/f86170dab93c280989faefffe30d7e30de47884d))
* **test-generation:** improve test class naming and post-processing ([1e9d53e](https://github.com/unit-mesh/auto-dev-vscode/commit/1e9d53e747b4645e872a02c182366b7999c74a90))
* **testing:** add printScopeGraph function and Golang test [#24](https://github.com/unit-mesh/auto-dev-vscode/issues/24) ([bfcb16e](https://github.com/unit-mesh/auto-dev-vscode/commit/bfcb16ed53349b582d6b5e51cb90744c152fed74))
* **toolchain-context:** add caching for context items and unify prompts ([4e3cfb2](https://github.com/unit-mesh/auto-dev-vscode/commit/4e3cfb264fb96333239cb2247ba1eaf6078a5148))



# [0.1.0](https://github.com/unit-mesh/auto-dev-vscode/compare/v0.0.6...v0.1.0) (2024-05-05)


### Bug Fixes

* **AutoDevExtension:** ensure webviewProtocol is defined before request ([2bb0a13](https://github.com/unit-mesh/auto-dev-vscode/commit/2bb0a13b975d4cd541e8d4531113753453e14fa8))
* **editor:** correct command name and remove unused import [#25](https://github.com/unit-mesh/auto-dev-vscode/issues/25) ([6ce7b14](https://github.com/unit-mesh/auto-dev-vscode/commit/6ce7b14509dfba2c990287b71f1b347ac4a2f17c))
* **embedding:** update localModelPath in TransformersEmbeddingProvider [#21](https://github.com/unit-mesh/auto-dev-vscode/issues/21) ([3398a18](https://github.com/unit-mesh/auto-dev-vscode/commit/3398a189d7357a235d6407b9a85f218efe9eb360))
* fix deps issue ([f80672e](https://github.com/unit-mesh/auto-dev-vscode/commit/f80672e98a32c93ce6cce0407af4b8fc1a0aa877))
* fix typo ([b175fe7](https://github.com/unit-mesh/auto-dev-vscode/commit/b175fe7fc947a9aee9cb246c79bd60ee063bdc3c))
* **scope:** correct scope_by_range function and update related tests [#25](https://github.com/unit-mesh/auto-dev-vscode/issues/25) ([2417079](https://github.com/unit-mesh/auto-dev-vscode/commit/241707913672adf72403f97fce49c6eda0a4cdad))
* **test:** remove LocalEmbeddingProvider from LocalInference test ([f06554e](https://github.com/unit-mesh/auto-dev-vscode/commit/f06554e9d9e261dede1fd0f5e7538b5212f06192))
* **tests:** update expected paths to include file extension [#25](https://github.com/unit-mesh/auto-dev-vscode/issues/25) ([607fadd](https://github.com/unit-mesh/auto-dev-vscode/commit/607faddaf0cd1e36a4c15fd0148324d806d40b82))
* **TestTemplateFinder:** update path handling for template files [#25](https://github.com/unit-mesh/auto-dev-vscode/issues/25) ([8f3b851](https://github.com/unit-mesh/auto-dev-vscode/commit/8f3b851c1fd9e77a9d303514df4c095575e0dd86))


### Features

* **AutoDevExtension:** add codebase indexing and webview protocol [#19](https://github.com/unit-mesh/auto-dev-vscode/issues/19) ([fa8c772](https://github.com/unit-mesh/auto-dev-vscode/commit/fa8c7729736e65321374a7745552af3f8ce711b3))
* **autotest:** add execution time logging and fix test file path [#12](https://github.com/unit-mesh/auto-dev-vscode/issues/12) ([3d1608b](https://github.com/unit-mesh/auto-dev-vscode/commit/3d1608bad2a866d7ac76eee4acfc60886b56c77b))
* **autotest:** change action type and target path in AutoTestActionExecutor and JavaTestGenProvider [#25](https://github.com/unit-mesh/auto-dev-vscode/issues/25) ([64ef750](https://github.com/unit-mesh/auto-dev-vscode/commit/64ef7504d391bda5300b100a9053186dfd549061))
* **autotest:** refactor test context creation in AutoTestActionExecutor [#12](https://github.com/unit-mesh/auto-dev-vscode/issues/12) ([ab448b9](https://github.com/unit-mesh/auto-dev-vscode/commit/ab448b91bb10fce5b4f5599c5e201066623ec539))
* **buildtool:** add message for missing vscode-gradle extension [#25](https://github.com/unit-mesh/auto-dev-vscode/issues/25) ([6535ae0](https://github.com/unit-mesh/auto-dev-vscode/commit/6535ae0403f8ef89b00765b3e22dcb63779445c5))
* **buildtool:** enhance Gradle and Go dependency parsing [#25](https://github.com/unit-mesh/auto-dev-vscode/issues/25) ([363f079](https://github.com/unit-mesh/auto-dev-vscode/commit/363f0794272c213e9ca95c448ee0e76cf0279eea))
* **buildtool:** improve Gradle dependency handling and file system operations [#25](https://github.com/unit-mesh/auto-dev-vscode/issues/25) ([52364ac](https://github.com/unit-mesh/auto-dev-vscode/commit/52364acf45a6d3d7bbceea79231f79aa858c2a08))
* **buildtool:** refactor Gradle and Go build tool providers to extend BaseBuildToolProvider [#24](https://github.com/unit-mesh/auto-dev-vscode/issues/24) ([fa22512](https://github.com/unit-mesh/auto-dev-vscode/commit/fa225121d5e148180dc38c4b86af943b6c008931))
* **chunker:** implement Chunker interface in MarkdownChunker and LinePartitionChunker [#19](https://github.com/unit-mesh/auto-dev-vscode/issues/19) ([5a00f0a](https://github.com/unit-mesh/auto-dev-vscode/commit/5a00f0a0f0553191329bea0e540d099aa001fe38))
* **ci:** add coverage report generation and rename BuiltinCodeSearch [#19](https://github.com/unit-mesh/auto-dev-vscode/issues/19) ([f12e2bc](https://github.com/unit-mesh/auto-dev-vscode/commit/f12e2bcc48f4f4ba6245a53994573d26bd453cbe))
* **cmake:** add CppFramework and CppTestFramework enums ([7bfc371](https://github.com/unit-mesh/auto-dev-vscode/commit/7bfc37199434d3a46064762f3f945dae884bf9de))
* **code-context:** add builtInTypes to language configs [#25](https://github.com/unit-mesh/auto-dev-vscode/issues/25) ([eb91ac5](https://github.com/unit-mesh/auto-dev-vscode/commit/eb91ac505818fdc1e60f75e07af4c32f6e2cbaaa))
* **code-parser:** add support for Lombok and field parsing in Java code [#25](https://github.com/unit-mesh/auto-dev-vscode/issues/25) ([8d8d32f](https://github.com/unit-mesh/auto-dev-vscode/commit/8d8d32f99037ce1d6c3aaa8cf93a3eaea0c5c40e))
* **code-search:** add Chinese stop words to tokenizer [#19](https://github.com/unit-mesh/auto-dev-vscode/issues/19) ([5070c03](https://github.com/unit-mesh/auto-dev-vscode/commit/5070c039d7e916b1aab16a466932cd2f1ee49710))
* **code-search:** add chunk computation and indexing to LanceDbIndex ([551f82c](https://github.com/unit-mesh/auto-dev-vscode/commit/551f82c167519963267b713d62612ff0be7dd577))
* **code-search:** add CodebaseIndexer and refactor search strategies [#19](https://github.com/unit-mesh/auto-dev-vscode/issues/19) ([1c54c7b](https://github.com/unit-mesh/auto-dev-vscode/commit/1c54c7bf38e28614085791ec7804b67a4957d85a))
* **code-search:** add custom TfIdf implementation [#19](https://github.com/unit-mesh/auto-dev-vscode/issues/19) ([601f59e](https://github.com/unit-mesh/auto-dev-vscode/commit/601f59e607c4f83924d29db736a44183d7782cbd))
* **code-search:** add custom TfIdf implementation [#19](https://github.com/unit-mesh/auto-dev-vscode/issues/19) ([d853e60](https://github.com/unit-mesh/auto-dev-vscode/commit/d853e60d19d0312c99531f0f4488afb48661b101))
* **code-search:** add DomainTermService for loading CSV data [#19](https://github.com/unit-mesh/auto-dev-vscode/issues/19) ([2ca4667](https://github.com/unit-mesh/auto-dev-vscode/commit/2ca466783557c741f4660838f78174bf944df364))
* **code-search:** add LanceDbIndex class and update CI workflows [#19](https://github.com/unit-mesh/auto-dev-vscode/issues/19) ([686a2da](https://github.com/unit-mesh/auto-dev-vscode/commit/686a2dadac5dd53737c0419b9a61d8b8db00d7bf))
* **code-search:** add OpenTabFilesManager for recent files [#19](https://github.com/unit-mesh/auto-dev-vscode/issues/19) ([e1258f7](https://github.com/unit-mesh/auto-dev-vscode/commit/e1258f7e39991d327dbe53d4dec90312b06e0599))
* **code-search:** add relevant class lookup in Java code [#25](https://github.com/unit-mesh/auto-dev-vscode/issues/25) ([3d37424](https://github.com/unit-mesh/auto-dev-vscode/commit/3d374243cbb8a08a7a7c7770d75ac7392143fc73))
* **code-search:** add SearchElement and SearchElementBuilder classes [#19](https://github.com/unit-mesh/auto-dev-vscode/issues/19) ([b19cf12](https://github.com/unit-mesh/auto-dev-vscode/commit/b19cf125e62985d055846a7463ba8c6166f6a0b7))
* **code-search:** add SimilarChunk class and update README [#19](https://github.com/unit-mesh/auto-dev-vscode/issues/19) ([f170526](https://github.com/unit-mesh/auto-dev-vscode/commit/f170526e0cf375845d98c08bf0cf6d463857b6bd))
* **code-search:** add smart code chunking functionality [#15](https://github.com/unit-mesh/auto-dev-vscode/issues/15) ([ff2ec3b](https://github.com/unit-mesh/auto-dev-vscode/commit/ff2ec3be7e2bd664cd4623849ee060d3f5757f4e))
* **code-search:** add term splitting functionality and tests [#19](https://github.com/unit-mesh/auto-dev-vscode/issues/19) ([b49dcfd](https://github.com/unit-mesh/auto-dev-vscode/commit/b49dcfd7ec9e305ec78ad23ad45b238f6fe7781b))
* **code-search:** add TransformersEmbeddingProvider to CodebaseIndexer [#19](https://github.com/unit-mesh/auto-dev-vscode/issues/19) ([01c6c4a](https://github.com/unit-mesh/auto-dev-vscode/commit/01c6c4a3c54f756e283c2dd716ffa5889fef19d1))
* **code-search:** enhance code documentation and refactor method names [#25](https://github.com/unit-mesh/auto-dev-vscode/issues/25) ([df39079](https://github.com/unit-mesh/auto-dev-vscode/commit/df390796a890f131a938b5720e13060a438f5cad))
* **code-search:** enhance import references retrieval in ScopeGraph [#25](https://github.com/unit-mesh/auto-dev-vscode/issues/25) ([d72b3ef](https://github.com/unit-mesh/auto-dev-vscode/commit/d72b3ef307917a0ed7b1af3769eed27839aa5b5d))
* **code-search:** enhance ScopeGraph and update tests [#25](https://github.com/unit-mesh/auto-dev-vscode/issues/25) ([3ca83fc](https://github.com/unit-mesh/auto-dev-vscode/commit/3ca83fc21fb344da47ad621e038f6bcee86a70ad))
* **code-search:** enhance SimilarChunk with new methods and align to Intellij IDEA version [#19](https://github.com/unit-mesh/auto-dev-vscode/issues/19) ([c25797c](https://github.com/unit-mesh/auto-dev-vscode/commit/c25797cf856b06fe8b70424fad1f1a2e776b5e64))
* **code-search:** enhance SimilarChunkTokenizer and add tests ([7c50f1f](https://github.com/unit-mesh/auto-dev-vscode/commit/7c50f1fbfbc5dca662fa4c2d3b838b6800d55a62))
* **code-search:** implement basic code chunker and related tests [#19](https://github.com/unit-mesh/auto-dev-vscode/issues/19) ([5445c07](https://github.com/unit-mesh/auto-dev-vscode/commit/5445c078baa3c28d3a63dc3b3b41fed3f95d669d))
* **code-search:** implement Jaccard similarity algorithm and refactor SimilarChunkSearcher ([ba2b11b](https://github.com/unit-mesh/auto-dev-vscode/commit/ba2b11b98bc626be3160b1679f0045d39f840f92))
* **code-search:** implement singleton pattern and refactor code search [#19](https://github.com/unit-mesh/auto-dev-vscode/issues/19) ([00d9f46](https://github.com/unit-mesh/auto-dev-vscode/commit/00d9f4605b566f36e154a22602be36ea624564de))
* **code-search:** improve tokenization and path calculation in SimilarChunk [#19](https://github.com/unit-mesh/auto-dev-vscode/issues/19) ([12829a7](https://github.com/unit-mesh/auto-dev-vscode/commit/12829a784da97df9086a06a4c8e98d613b20be68))
* **code-search:** introduce EmbeddingProvider and refactor indexing [#19](https://github.com/unit-mesh/auto-dev-vscode/issues/19) ([d6b7b79](https://github.com/unit-mesh/auto-dev-vscode/commit/d6b7b7968b24cb1a6a4a04948dd4d81c50a2c3e1))
* **code-search:** refactor code chunking logic [#19](https://github.com/unit-mesh/auto-dev-vscode/issues/19) ([04bf3ff](https://github.com/unit-mesh/auto-dev-vscode/commit/04bf3ffaedd28f70c27e0bfd48a5074b69c2d30c))
* **code-search:** refactor SemanticSearch and TfIdfWithSemanticChunkSearch classes [#19](https://github.com/unit-mesh/auto-dev-vscode/issues/19) ([d4dfe8a](https://github.com/unit-mesh/auto-dev-vscode/commit/d4dfe8ad3a3579fb770c07c9bd9ac12db88e239d))
* **code-search:** replace word splitting with term splitting in SimilarChunkTokenizer ([ebd5b3c](https://github.com/unit-mesh/auto-dev-vscode/commit/ebd5b3c1f54af5d9fc5d464c326ed61b0a893993))
* **code-search:** update Chinese stop words list and add copyright notice ([8f60c7c](https://github.com/unit-mesh/auto-dev-vscode/commit/8f60c7ce5b05c22096c5fbc44efa6da773f6f399))
* **code-search:** update constants and clean up imports [#19](https://github.com/unit-mesh/auto-dev-vscode/issues/19) ([7e8d045](https://github.com/unit-mesh/auto-dev-vscode/commit/7e8d04586ed9936350d248e351b0e5aa11c4c747))
* **code-search:** update LocalInference and add test [#19](https://github.com/unit-mesh/auto-dev-vscode/issues/19) ([9697271](https://github.com/unit-mesh/auto-dev-vscode/commit/96972717ccd1919ab6f161c3ef0f349514a490b5))
* **codemodel:** add method IO parsing and system type flag [#25](https://github.com/unit-mesh/auto-dev-vscode/issues/25) ([1d70bff](https://github.com/unit-mesh/auto-dev-vscode/commit/1d70bffe566b5f49ba1fda1e95c05230d355b05d))
* **codemodel:** add support for nested classes and lombok handling [#25](https://github.com/unit-mesh/auto-dev-vscode/issues/25) ([be5402e](https://github.com/unit-mesh/auto-dev-vscode/commit/be5402e32be6e0c81609fbaaeab80fa2c19a489a))
* **codemodel:** enhance PlantUMLPresenter with detailed comments and syntax conversion [#25](https://github.com/unit-mesh/auto-dev-vscode/issues/25) ([95a5fac](https://github.com/unit-mesh/auto-dev-vscode/commit/95a5facf86766355bbf9eeae9568f1c3ec88af4a))
* **commands:** make parameters optional in autoTest [#15](https://github.com/unit-mesh/auto-dev-vscode/issues/15) ([5414561](https://github.com/unit-mesh/auto-dev-vscode/commit/541456135f2e6d5f522fb2af6b76df8b3915ba3b))
* **custom-action:** add AutoDevExtension parameter to execute and handleOutput methods [#4](https://github.com/unit-mesh/auto-dev-vscode/issues/4) ([c94809c](https://github.com/unit-mesh/auto-dev-vscode/commit/c94809c1a00777bce0051ab7d0e3c4ad6af29d9d))
* **DevIns:** init DevIns parser to project list ([56c8877](https://github.com/unit-mesh/auto-dev-vscode/commit/56c88775df4c60aaf4a2acb93ac5e8706813bec8)), closes [#23](https://github.com/unit-mesh/auto-dev-vscode/issues/23)
* **docs:** update .vscodeignore and README.md ([39b1a62](https://github.com/unit-mesh/auto-dev-vscode/commit/39b1a620014a439490f32f8a3cb0cd95ffb15e9a))
* **editor-api:** add indexing action to SystemActionService [#19](https://github.com/unit-mesh/auto-dev-vscode/issues/19) ([3181f4c](https://github.com/unit-mesh/auto-dev-vscode/commit/3181f4cf9386acb919108b97848779f431b38ed3))
* **editor-api:** add SystemActionService and integrate with AutoDevStatusManager [#19](https://github.com/unit-mesh/auto-dev-vscode/issues/19) ([7c888e0](https://github.com/unit-mesh/auto-dev-vscode/commit/7c888e04d313e363376f470999de3491e6b8cb5b))
* **editor-api:** replace indexing with search functionality [#19](https://github.com/unit-mesh/auto-dev-vscode/issues/19) ([f22accd](https://github.com/unit-mesh/auto-dev-vscode/commit/f22accdf5026a1b54302e1f6c880f79c65aae3df))
* **editor:** add directory traversal and ignore utilities [#19](https://github.com/unit-mesh/auto-dev-vscode/issues/19) ([a208653](https://github.com/unit-mesh/auto-dev-vscode/commit/a208653d6403aa8b5c3bc79cd16dc6c161b888de))
* **editor:** add function to convert CodeFunction to TextRange [#25](https://github.com/unit-mesh/auto-dev-vscode/issues/25) ([09bac03](https://github.com/unit-mesh/auto-dev-vscode/commit/09bac037c299579c1d6247c3fa63262dac5db5bb))
* **editor:** filter and return only code files [#15](https://github.com/unit-mesh/auto-dev-vscode/issues/15) ([cabc31b](https://github.com/unit-mesh/auto-dev-vscode/commit/cabc31be231884f80dd9e628c6e3b3c4af09cdf3))
* **editor:** optimize user input selection in commands [#4](https://github.com/unit-mesh/auto-dev-vscode/issues/4) ([16b835d](https://github.com/unit-mesh/auto-dev-vscode/commit/16b835d20e9e3f9df5e79d43b7b9dace6183fec4))
* **editor:** replace external uuid with custom implementation ([d51787f](https://github.com/unit-mesh/auto-dev-vscode/commit/d51787fb30629fd145289178dab5882b03418493))
* **embedding:** add LocalInference class and update TransformersEmbeddingProvider [#21](https://github.com/unit-mesh/auto-dev-vscode/issues/21) ([a5c624c](https://github.com/unit-mesh/auto-dev-vscode/commit/a5c624c458834b2122c9e8dcede10a58c214cb1a))
* **embedding:** add onnxruntime-node to vite config and enable ONNX in TransformersEmbeddingProvider [#21](https://github.com/unit-mesh/auto-dev-vscode/issues/21) ([06aa4fd](https://github.com/unit-mesh/auto-dev-vscode/commit/06aa4fdee0c9ac79ac2e9ff38faaf729ea21c957))
* **embedding:** add reshape function to meanPooling [#19](https://github.com/unit-mesh/auto-dev-vscode/issues/19) ([6d40927](https://github.com/unit-mesh/auto-dev-vscode/commit/6d4092758febb736cc37d21fdef7262a258cd2c7))
* **embedding:** refactor embedding utilities and enhance OpenAIEmbedding [#19](https://github.com/unit-mesh/auto-dev-vscode/issues/19) ([b06138f](https://github.com/unit-mesh/auto-dev-vscode/commit/b06138f60fd9487e6428ddda98bce90802b388ca))
* **embedding:** refactor LocalInference and add meanPooling [#19](https://github.com/unit-mesh/auto-dev-vscode/issues/19) ([9780d9b](https://github.com/unit-mesh/auto-dev-vscode/commit/9780d9bd09301413fa33eed3bddbf4800a8a11fc))
* **embedding:** replace LocalModelEmbedding with TransformersEmbeddingProvider [#19](https://github.com/unit-mesh/auto-dev-vscode/issues/19) ([38f3a6a](https://github.com/unit-mesh/auto-dev-vscode/commit/38f3a6a7a5080747ac3ff14536f41801d0b20be9))
* **embedding:** replace TransformersEmbeddingProvider with LocalInference [#21](https://github.com/unit-mesh/auto-dev-vscode/issues/21) ([40fbb23](https://github.com/unit-mesh/auto-dev-vscode/commit/40fbb23201a420ab8649ece2aac70e4d0abf805a))
* **embedding:** update model path and add test for TransformersEmbeddingProvider [#19](https://github.com/unit-mesh/auto-dev-vscode/issues/19) ([c8ef61f](https://github.com/unit-mesh/auto-dev-vscode/commit/c8ef61fd3980b8219db48e9e2e66f3f1268fbb36))
* **embedding:** update ONNX runtime usage in LocalInference [#21](https://github.com/unit-mesh/auto-dev-vscode/issues/21) ([8a3c29a](https://github.com/unit-mesh/auto-dev-vscode/commit/8a3c29a2f196c1bf434fcee29f121915b3e311ef))
* **extension:** add globalThis.self assignment in src/extension.ts @CGQAQ [#21](https://github.com/unit-mesh/auto-dev-vscode/issues/21) ([11f4d86](https://github.com/unit-mesh/auto-dev-vscode/commit/11f4d863a9ebf058d09a0745177612ac2e72237a))
* **gradle:** improve regex and add sub_projects test [#25](https://github.com/unit-mesh/auto-dev-vscode/issues/25) ([9edbda3](https://github.com/unit-mesh/auto-dev-vscode/commit/9edbda3080324f127515688f4825ac8d46fc4913))
* **indexer:** add new codebase index classes [#19](https://github.com/unit-mesh/auto-dev-vscode/issues/19) ([a29383d](https://github.com/unit-mesh/auto-dev-vscode/commit/a29383d2c146bf37755002baa6b9efafa83bf362))
* **indexing:** enhance indexing functionality and types and align to continue API design for temp [#22](https://github.com/unit-mesh/auto-dev-vscode/issues/22) ([5e9296f](https://github.com/unit-mesh/auto-dev-vscode/commit/5e9296fbd6c22f2de6e76c0a1268d95a4882382f))
* **JaccardSimilarity:** add tests and documentation ([9d433b6](https://github.com/unit-mesh/auto-dev-vscode/commit/9d433b6bbd10e07e17f3a2ffd3b4324fef6e9655))
* **java-structurer:** add field extraction functionality [#25](https://github.com/unit-mesh/auto-dev-vscode/issues/25) ([3095082](https://github.com/unit-mesh/auto-dev-vscode/commit/309508239bdf9ce921af96750962269cba6963a9))
* **java:** add package query to Java language configuration [#25](https://github.com/unit-mesh/auto-dev-vscode/issues/25) ([adaaf5f](https://github.com/unit-mesh/auto-dev-vscode/commit/adaaf5ff01e35cf047ca5f949c6dabd6b5b08100))
* **PackageVersionParser:** add new interface and implement in GoModParser ([711c0c8](https://github.com/unit-mesh/auto-dev-vscode/commit/711c0c8f91f2a337472a4dc1c58aa03b282acb25))
* **scope-graph:** enhance import handling and method extraction [#25](https://github.com/unit-mesh/auto-dev-vscode/issues/25) ([1391e3e](https://github.com/unit-mesh/auto-dev-vscode/commit/1391e3e87e9e7091f52fe8e15523af1d94e4f1e4))
* **search:** add separate method for adding documents [#19](https://github.com/unit-mesh/auto-dev-vscode/issues/19) ([c7d9987](https://github.com/unit-mesh/auto-dev-vscode/commit/c7d9987887ef4b7507fc9f38b9b1cae6080d401e))
* **search:** enhance document handling and term splitting [#19](https://github.com/unit-mesh/auto-dev-vscode/issues/19) ([a80f2a9](https://github.com/unit-mesh/auto-dev-vscode/commit/a80f2a9146f02bfd08587b0cb1a0310c4a428965))
* **search:** refactor semantic search and add cancellation utility [#19](https://github.com/unit-mesh/auto-dev-vscode/issues/19) ([6b00e26](https://github.com/unit-mesh/auto-dev-vscode/commit/6b00e265dabba1ecdec0af25c6886ba220007f03))
* **team-service:** add DomainTermService with CSV parsing [#19](https://github.com/unit-mesh/auto-dev-vscode/issues/19) ([311c283](https://github.com/unit-mesh/auto-dev-vscode/commit/311c283a8a98ff52b2e34b086798c9b11ca2be30))
* **test-generation:** add GoTestGenProvider for Go language support [#24](https://github.com/unit-mesh/auto-dev-vscode/issues/24) ([6272ba3](https://github.com/unit-mesh/auto-dev-vscode/commit/6272ba3cf02ffaeced8c3cbc1d012d8f6f45ccbf))
* **test-generation:** enhance test file creation and context collection [#12](https://github.com/unit-mesh/auto-dev-vscode/issues/12) ([d4e6316](https://github.com/unit-mesh/auto-dev-vscode/commit/d4e631639f3fbe949023e59b0c1d2154d6b708b4))
* **test-generation:** implement test file creation for Go language [#24](https://github.com/unit-mesh/auto-dev-vscode/issues/24) ([0cd45da](https://github.com/unit-mesh/auto-dev-vscode/commit/0cd45dafacaf4a53ae51060f0fcb55bad7d22a84))
* **test-generation:** return array of CodeStructure in lookupRelevantClass ([702f805](https://github.com/unit-mesh/auto-dev-vscode/commit/702f805ef3407fbb8e3459e4307ef611346b7d64))
* **testing:** add new test for Java and refactor NamedElementBuilder usage ([be9477f](https://github.com/unit-mesh/auto-dev-vscode/commit/be9477f45bfbda3809e5dc119997f07d62d5defb))
* **testing:** enhance test setup and logging [#25](https://github.com/unit-mesh/auto-dev-vscode/issues/25) ([75f9bb6](https://github.com/unit-mesh/auto-dev-vscode/commit/75f9bb6a023471fafe4c3d1183edeea8422593f9))
* **tests:** update expected paths and refactor path generation [#25](https://github.com/unit-mesh/auto-dev-vscode/issues/25) ([a50baf3](https://github.com/unit-mesh/auto-dev-vscode/commit/a50baf307d4b3d0485efc41af2403e56b174ffa0))
* **tests:** update method extraction and import handling in tests [#25](https://github.com/unit-mesh/auto-dev-vscode/issues/25) ([50f77ea](https://github.com/unit-mesh/auto-dev-vscode/commit/50f77eac558c6ef99918ade47451f20d5e66702d))
* **test:** update test case and add new methods in ScopeGraph [#25](https://github.com/unit-mesh/auto-dev-vscode/issues/25) ([38c5bd2](https://github.com/unit-mesh/auto-dev-vscode/commit/38c5bd2773295577f5ed6b205b1dd1259aeff68d))
* **token:** enhance token counting and message pruning [#19](https://github.com/unit-mesh/auto-dev-vscode/issues/19) ([2ec1643](https://github.com/unit-mesh/auto-dev-vscode/commit/2ec164343888c9c07726a98355b8be922ac99f0b))
* **toolchain-context:** add Go build tool provider and GoMod parser [#24](https://github.com/unit-mesh/auto-dev-vscode/issues/24) ([0c970a9](https://github.com/unit-mesh/auto-dev-vscode/commit/0c970a9bbc531c47bb910dd6df380554d5017404))
* **toolchain-context:** add Go frameworks and test frameworks enums ([62a3f67](https://github.com/unit-mesh/auto-dev-vscode/commit/62a3f678f43a35cc52d55da59fafd7fa23dcd14b))
* **toolchain-context:** enhance error handling and context collection [#25](https://github.com/unit-mesh/auto-dev-vscode/issues/25) ([7645215](https://github.com/unit-mesh/auto-dev-vscode/commit/76452150c663f4cd0c01c5312188b96c55707dd1))
* **webview:** add message handling and error reporting [#4](https://github.com/unit-mesh/auto-dev-vscode/issues/4) ([5b1e9b3](https://github.com/unit-mesh/auto-dev-vscode/commit/5b1e9b395ef060f076f09237283bc73da3a76111))
* **webview:** add messageType parameter to reply function [#12](https://github.com/unit-mesh/auto-dev-vscode/issues/12) ([0907d3c](https://github.com/unit-mesh/auto-dev-vscode/commit/0907d3c50ec03012292b6f35145c8268f724fef5))
* **webview:** implement message handling and request methods [#12](https://github.com/unit-mesh/auto-dev-vscode/issues/12) ([1ec49d5](https://github.com/unit-mesh/auto-dev-vscode/commit/1ec49d5003046526119e82780ec4e825c90b380a))


### Reverts

* Revert "refactor(system): rename 'system' to 'settings' across multiple files" ([bc6af27](https://github.com/unit-mesh/auto-dev-vscode/commit/bc6af273dafd836f93003e24bbd525601498f895))



## [0.0.6](https://github.com/unit-mesh/auto-dev-vscode/compare/v0.0.5...v0.0.6) (2024-04-25)


### Bug Fixes

* fix lost yaml deps issue ([60ea799](https://github.com/unit-mesh/auto-dev-vscode/commit/60ea799ea8c715b8d7e02319c07e405818bc207c))
* fix typ issues ([4f527aa](https://github.com/unit-mesh/auto-dev-vscode/commit/4f527aae141902ef763937a507ab5e2f4465be2d))



## [0.0.5](https://github.com/unit-mesh/auto-dev-vscode/compare/v0.0.4...v0.0.5) (2024-04-25)


### Features

* Add file generation task and rename FencedCodeBlock to MarkdownCodeBlock [#15](https://github.com/unit-mesh/auto-dev-vscode/issues/15) ([7c061be](https://github.com/unit-mesh/auto-dev-vscode/commit/7c061be6a015004aeeabdab6d0f13a87192fc1f0))
* **commands:** add generateCommitMessage function ([3b02008](https://github.com/unit-mesh/auto-dev-vscode/commit/3b0200897085ba42a0f560fd2812f41db9c26364))
* **commands:** add generateCommitMessage function to commands.ts [#15](https://github.com/unit-mesh/auto-dev-vscode/issues/15) ([46250df](https://github.com/unit-mesh/auto-dev-vscode/commit/46250dffb954dee49012bdfd90f7d6f7a36a226d))
* **custom-action:** add comment symbol to context and improve logging [#15](https://github.com/unit-mesh/auto-dev-vscode/issues/15) ([1a3668f](https://github.com/unit-mesh/auto-dev-vscode/commit/1a3668ff09aa0bc1f4c25b2cf7ebdccaae9744a4))
* **editor-api:** enhance QuickAction selection handling [#15](https://github.com/unit-mesh/auto-dev-vscode/issues/15) ([1025ac0](https://github.com/unit-mesh/auto-dev-vscode/commit/1025ac022e05f079da16e1a892032c65bf914076))
* **editor:** rename NamedElementBlock to NamedElement and add language property [#15](https://github.com/unit-mesh/auto-dev-vscode/issues/15) ([69c8f9b](https://github.com/unit-mesh/auto-dev-vscode/commit/69c8f9bb56788b019621f35f1f6094482b908b3c))
* **prompt-manage:** add CustomActionContextBuilder and CustomActionExecutor classes [#15](https://github.com/unit-mesh/auto-dev-vscode/issues/15) ([064c56f](https://github.com/unit-mesh/auto-dev-vscode/commit/064c56fe8a6e3d4f3c6c678985d29f18fbf6a10f))
* **prompt-manage:** add PromptOverrider class ([adcd3cb](https://github.com/unit-mesh/auto-dev-vscode/commit/adcd3cb4e7bd1fa49cbe20ab026d9ef14578bb18))
* **prompt-manage:** add text insertion and update functionality [#15](https://github.com/unit-mesh/auto-dev-vscode/issues/15) ([f1fc079](https://github.com/unit-mesh/auto-dev-vscode/commit/f1fc079e1c9fe758169050b1f7809806a7ba4eae))
* **prompt-manage:** enhance CustomActionContext with new properties [#15](https://github.com/unit-mesh/auto-dev-vscode/issues/15) ([77ec1bd](https://github.com/unit-mesh/auto-dev-vscode/commit/77ec1bdad25d66086ef0f14678fe41eca63916bc))
* **prompt-manage:** refactor code to use outputText and add toolchain context [#15](https://github.com/unit-mesh/auto-dev-vscode/issues/15) ([06d83da](https://github.com/unit-mesh/auto-dev-vscode/commit/06d83da9318d95e3d5e08f1c4b23b53c43969833))
* **prompt-manage:** refactor custom actions and related components [#15](https://github.com/unit-mesh/auto-dev-vscode/issues/15) ([090b7d2](https://github.com/unit-mesh/auto-dev-vscode/commit/090b7d220654a2e0e3cd70a8754b08a6005b1004))
* **prompt-manage:** replace CustomActionContext with CustomActionVariable [#15](https://github.com/unit-mesh/auto-dev-vscode/issues/15) ([7a91b19](https://github.com/unit-mesh/auto-dev-vscode/commit/7a91b194089ef46418f3a1c43b7692d33b9a59cc))
* **prompt-manager:** refactor custom action prompt and context [#15](https://github.com/unit-mesh/auto-dev-vscode/issues/15) ([f0a5b4f](https://github.com/unit-mesh/auto-dev-vscode/commit/f0a5b4f5af440895ceda6b7bbab5cba27f0db5d2))
* **prompt:** add PromptLoader to load custom action prompts [#15](https://github.com/unit-mesh/auto-dev-vscode/issues/15) ([6499d4f](https://github.com/unit-mesh/auto-dev-vscode/commit/6499d4f5f58a53906345edc9053ff841dcaa304b))
* **service:** add ProjectService and Service classes [#15](https://github.com/unit-mesh/auto-dev-vscode/issues/15) ([053d6b7](https://github.com/unit-mesh/auto-dev-vscode/commit/053d6b7636cd9503c3c64db758e3bcc05be4b4f0))
* **template-render:** add VSCodeTemplateLoader as default loader [#15](https://github.com/unit-mesh/auto-dev-vscode/issues/15) ([0a86688](https://github.com/unit-mesh/auto-dev-vscode/commit/0a866881df07ff0e06eb17f3addc951189e2439c))



## [0.0.4](https://github.com/unit-mesh/auto-dev-vscode/compare/v0.0.3...v0.0.4) (2024-04-24)


### Bug Fixes

* **editor:** correct language map file names [#15](https://github.com/unit-mesh/auto-dev-vscode/issues/15) ([745461f](https://github.com/unit-mesh/auto-dev-vscode/commit/745461f7c071d7dc0b2cc683553adc573cc593f2))
* fix typos ([4070604](https://github.com/unit-mesh/auto-dev-vscode/commit/40706048febdb38b814a1512a0f5f2ee828c9824))
* 插件启动错误 ([e874b94](https://github.com/unit-mesh/auto-dev-vscode/commit/e874b94bba0d156461c94b5f4fd444a4744c3645))


### Features

* **action:** refactor ActionCreator to use AutoDevExtension and add support for class actions [#12](https://github.com/unit-mesh/auto-dev-vscode/issues/12) ([0287145](https://github.com/unit-mesh/auto-dev-vscode/commit/028714506d2168c0bbad1bbf525764c06930e985))
* **action:** refactor ActionCreatorContext and related imports ([5b82bae](https://github.com/unit-mesh/auto-dev-vscode/commit/5b82baeac2e56151566d2f91cfaa1daf2329496d))
* **cache-manager:** use singleton instance for structure provider ([199c2b6](https://github.com/unit-mesh/auto-dev-vscode/commit/199c2b64299cc7dd5a23d8a9c6928da94fc52d84))
* **chunker:** add byLines method for chunking by line size ([be3b810](https://github.com/unit-mesh/auto-dev-vscode/commit/be3b810616f365ffe1134573f6d107a98a0f0fcc))
* **code-actions:** add applicability check to action creators ([4c71943](https://github.com/unit-mesh/auto-dev-vscode/commit/4c71943810f3ae2a34d5bc332a9cb0752ed746a9))
* **code-actions:** refactor and add support for more granular actions in the AutoDevCodeActionProvider. Implement AutoDocCreator to generate documentation for methods and classes. ([c332bf7](https://github.com/unit-mesh/auto-dev-vscode/commit/c332bf7b5a48d9797e7aabd5a3c5245ca2e730f6))
* **code-actions:** refactor method actions and add support for class actions ([529d60b](https://github.com/unit-mesh/auto-dev-vscode/commit/529d60b8f4874daf2db94be573cfcc403d7669da))
* **code-search:** add FileFilter class for file inclusion logic [#15](https://github.com/unit-mesh/auto-dev-vscode/issues/15) ([c3d701d](https://github.com/unit-mesh/auto-dev-vscode/commit/c3d701d3ab37004bf4b969e1ca6c5e245d8adcc8))
* **code-search:** add SemanticSearch class and CodeSearch extension ([4534a8c](https://github.com/unit-mesh/auto-dev-vscode/commit/4534a8cac5134c6e70c8820ac35d6e4f46e3652c))
* **code-search:** add support for embedding-based similarity calculation [#15](https://github.com/unit-mesh/auto-dev-vscode/issues/15) ([22da4ff](https://github.com/unit-mesh/auto-dev-vscode/commit/22da4ff183626ef512706269ac52b82deffe94ab))
* **code-search:** add TfIdfWithSemanticChunkSearch class using Natural's TfIdf library for calculating similarity between code chunks. Introduces new methods `addDocument` and `search` [#15](https://github.com/unit-mesh/auto-dev-vscode/issues/15) ([4669eae](https://github.com/unit-mesh/auto-dev-vscode/commit/4669eae8f5fff4e8e257a2361177544b2e2562f5))
* **code-search:** init TfIdfWithSemanticChunkSearch class ([4de39cd](https://github.com/unit-mesh/auto-dev-vscode/commit/4de39cdf7664a842c57489b6b4f7e9933cd14049))
* **code-search:** introduce caching for embeddings to improve performance [#15](https://github.com/unit-mesh/auto-dev-vscode/issues/15) ([79334d9](https://github.com/unit-mesh/auto-dev-vscode/commit/79334d9ddfa9c834b9de86fa6d231a16af62ced5))
* **code-search:** refactor chunk search strategy and add chunk filter class [#15](https://github.com/unit-mesh/auto-dev-vscode/issues/15) ([aeaf8f7](https://github.com/unit-mesh/auto-dev-vscode/commit/aeaf8f70f1b2a04b5b723e23f2f63a41c02a3908))
* **code-search:** refactor chunk-strategy files to chunk and embedding directories [#15](https://github.com/unit-mesh/auto-dev-vscode/issues/15) ([9c59bc1](https://github.com/unit-mesh/auto-dev-vscode/commit/9c59bc17edaa1cad57748067e1b17df29bd4e0ae))
* **code-search:** refactor chunkers with clearer names and comments [#15](https://github.com/unit-mesh/auto-dev-vscode/issues/15) ([2a4cbd0](https://github.com/unit-mesh/auto-dev-vscode/commit/2a4cbd0f14f5fd6cd24a9c525641287334d31d2b))
* **code-search:** refactor chunking strategy and add new chunkers [#15](https://github.com/unit-mesh/auto-dev-vscode/issues/15) ([7ae48a7](https://github.com/unit-mesh/auto-dev-vscode/commit/7ae48a795b101aac991fd09d2af63f9c865372e1))
* **code-search:** refactor code search related files to use semantic subdirectory structure and update imports accordingly [#15](https://github.com/unit-mesh/auto-dev-vscode/issues/15) ([4d3f1f7](https://github.com/unit-mesh/auto-dev-vscode/commit/4d3f1f7259e54698def1cdd58334f2cf6e4f9862))
* **code-search:** refactor file filtering and chunking logic to use external binary file detection library. ([d0c6f76](https://github.com/unit-mesh/auto-dev-vscode/commit/d0c6f7631d7b1dd7fe7119898840120c83438fae))
* **code-search:** refactor FileFilter with ignore package and add support for .gitignore ([1783197](https://github.com/unit-mesh/auto-dev-vscode/commit/1783197a1436f3f68735435e8eba5e8540d536dd)), closes [#15](https://github.com/unit-mesh/auto-dev-vscode/issues/15)
* **codesearch:** refactor and add type safety to chunk search strategy [#15](https://github.com/unit-mesh/auto-dev-vscode/issues/15) ([00c6afd](https://github.com/unit-mesh/auto-dev-vscode/commit/00c6afdef5627ad2bcb66a544c5595f267ffe6d0))
* **editor:** add BlockBuilder for block selection [#15](https://github.com/unit-mesh/auto-dev-vscode/issues/15) ([1682c3f](https://github.com/unit-mesh/auto-dev-vscode/commit/1682c3f3f87e72182a56f1261f45d0b2878bb16d))
* **editor:** add CursorUtil for selection handling [#15](https://github.com/unit-mesh/auto-dev-vscode/issues/15) ([3a5dad6](https://github.com/unit-mesh/auto-dev-vscode/commit/3a5dad6df3c635c31361a0eeefe5bc3d63b492ef))
* **editor:** add documentation for NamedElementBlock class [#15](https://github.com/unit-mesh/auto-dev-vscode/issues/15) ([92b1165](https://github.com/unit-mesh/auto-dev-vscode/commit/92b1165ac848579260a65873bdc350379bc7eda8))
* **editor:** add function to check if node is top level [#15](https://github.com/unit-mesh/auto-dev-vscode/issues/15) ([656748a](https://github.com/unit-mesh/auto-dev-vscode/commit/656748a36e9372f3dd59ace398a9c4aa37b60ecd))
* **editor:** add method to build document from suggestion [#15](https://github.com/unit-mesh/auto-dev-vscode/issues/15) ([9e2aaa6](https://github.com/unit-mesh/auto-dev-vscode/commit/9e2aaa6468e5ed1df2bd4d1799bb8813425ee2d0))
* **editor:** add method to build document from suggestion [#15](https://github.com/unit-mesh/auto-dev-vscode/issues/15) ([7c04053](https://github.com/unit-mesh/auto-dev-vscode/commit/7c0405388000ba2b814edc651a9d684c7317acd7))
* **editor:** add support for selecting comment range [#15](https://github.com/unit-mesh/auto-dev-vscode/issues/15) ([f154520](https://github.com/unit-mesh/auto-dev-vscode/commit/f154520e1b62606fbfda4b2e351a3db0075e4ca9))
* **editor:** add SyntaxNodeUtil for handling syntax nodes [#15](https://github.com/unit-mesh/auto-dev-vscode/issues/15) ([b8bcb42](https://github.com/unit-mesh/auto-dev-vscode/commit/b8bcb429a288496df8b0ded01fb3584a5104538d))
* **editor:** add test data generation action [#15](https://github.com/unit-mesh/auto-dev-vscode/issues/15) ([7c3296e](https://github.com/unit-mesh/auto-dev-vscode/commit/7c3296e309298fb071fb05dd5ea25a530e88f028))
* **editor:** add TestDataTemplateContext interface [#15](https://github.com/unit-mesh/auto-dev-vscode/issues/15) ([020dc03](https://github.com/unit-mesh/auto-dev-vscode/commit/020dc0349c5579b005301912de8d72ad55cd0430))
* **editor:** improve AutoDevCodeLensProvider with localized title for autoComment command ([479ac67](https://github.com/unit-mesh/auto-dev-vscode/commit/479ac67269ff2fd353e7b7519a50a4106d15da3b))
* **editor:** introduce ActionCreator and AutoDevCodeActionProvider ([b4f6e51](https://github.com/unit-mesh/auto-dev-vscode/commit/b4f6e518a1e247c33ed129b9f6a295b76e7539c1))
* **editor:** refactor code action provider and add new action creator for generating API data. ([cf6ee09](https://github.com/unit-mesh/auto-dev-vscode/commit/cf6ee09ff5cd884faa57041be5426438322d53ae))
* **editor:** refactor code actions and add new AutoDocCreator class [#12](https://github.com/unit-mesh/auto-dev-vscode/issues/12) ([a0f6f13](https://github.com/unit-mesh/auto-dev-vscode/commit/a0f6f1348ab3412d1e27c8fe8ce1db87a7809363))
* **embedding:** add OpenAIEmbedding class and refactor RemoteEmbedding to return Embedding instead of void [#15](https://github.com/unit-mesh/auto-dev-vscode/issues/15) ([aad9d21](https://github.com/unit-mesh/auto-dev-vscode/commit/aad9d21fce6cf56be343572f229873a097737cbd))
* **file-filter:** refactor binary check to use text file detection [#15](https://github.com/unit-mesh/auto-dev-vscode/issues/15) ([5a073af](https://github.com/unit-mesh/auto-dev-vscode/commit/5a073af39c3bd7fb8a17af90b98dc8c5095a73a5))
* **file-filter:** refactor binary file detection with improved logic and performance optimizations. ([5368e84](https://github.com/unit-mesh/auto-dev-vscode/commit/5368e843ee543382cba2c91160362490a88ddd53))
* **prompt-manage:** add ActionType enum [#15](https://github.com/unit-mesh/auto-dev-vscode/issues/15) ([5ff43cc](https://github.com/unit-mesh/auto-dev-vscode/commit/5ff43cc3b614805a5d607b5599a7a39cdbf1732f))
* **prompt:** add custom prompt registration and construction [#15](https://github.com/unit-mesh/auto-dev-vscode/issues/15) ([bf1e0ca](https://github.com/unit-mesh/auto-dev-vscode/commit/bf1e0ca14ce8676d13961dce9a6b4e87d38a8fd0))
* **prompt:** add GenApiData action and template [#15](https://github.com/unit-mesh/auto-dev-vscode/issues/15) ([a860fdd](https://github.com/unit-mesh/auto-dev-vscode/commit/a860fddb463fcce37440fe2dd596d8f6667a7897))
* **providers:** add injectable decorator to action creators ([7a56549](https://github.com/unit-mesh/auto-dev-vscode/commit/7a56549ddbdebbea1493fe933bfd406c2edbf793))
* **providers:** refactor action provider creation to use flatMap and forEach ([25596ec](https://github.com/unit-mesh/auto-dev-vscode/commit/25596ecdac6f2af778ef735f5bf5c72b3e0dd43d))
* **providers:** refactor AutoDevActionProvider to use identifierRange for test actions ([88affcf](https://github.com/unit-mesh/auto-dev-vscode/commit/88affcf048ae1dd1b10beef5be8c5214ae19acfa))
* **search:** add cancellation token support to TfIdfWithSemanticChunkSearch [#15](https://github.com/unit-mesh/auto-dev-vscode/issues/15) ([01c4067](https://github.com/unit-mesh/auto-dev-vscode/commit/01c4067cd3b588ddc4885e849a14a2928fc8adc4))
* **search:** refactor searchFileChunks to use text and CancellationToken [#15](https://github.com/unit-mesh/auto-dev-vscode/issues/15) ([ad8c5cb](https://github.com/unit-mesh/auto-dev-vscode/commit/ad8c5cba61b84e8023afbe5d0339c2557023e6fe))
* **search:** try to implement semantic search strategy and cosine similarity function for GitHub Copilot Chatbot. ([449a5cf](https://github.com/unit-mesh/auto-dev-vscode/commit/449a5cf59c9145d15a2ba2219c62a6de06e89376))
* **tooling:** introduce singleton pattern for NpmBuildToolProvider and add support for GradleBuildToolProvider [#12](https://github.com/unit-mesh/auto-dev-vscode/issues/12) ([f461a16](https://github.com/unit-mesh/auto-dev-vscode/commit/f461a16814689773273dbfc720e1e310a0a7c1d4))
* **typescript:** add support for generator functions [#15](https://github.com/unit-mesh/auto-dev-vscode/issues/15) ([dd5bdf4](https://github.com/unit-mesh/auto-dev-vscode/commit/dd5bdf48c87d22b9e83ff7678945cc8a3226d1be))
* **utils:** add binary file detection and processing functionality to FileFilter.ts [#15](https://github.com/unit-mesh/auto-dev-vscode/issues/15) ([138e61c](https://github.com/unit-mesh/auto-dev-vscode/commit/138e61cdc09551befa3398417d8e32c54b15740e))
* **utils:** refactor FileFilter to use modern TypeScript features and improve code readability. ([06ed47d](https://github.com/unit-mesh/auto-dev-vscode/commit/06ed47daa5e4e4fef437f465669551971b04ad7e))
* 添加侧边栏对话面板 ([3a23376](https://github.com/unit-mesh/auto-dev-vscode/commit/3a233760de0615ae2781048e0e5720d12380894d))



## [0.0.3](https://github.com/unit-mesh/auto-dev-vscode/compare/e862bc24108966e3b7438dfbfb77ec2745000144...v0.0.3) (2024-04-19)


### Bug Fixes

* add problemMatcher to let the debug session start AFTER first success build ([18a22f1](https://github.com/unit-mesh/auto-dev-vscode/commit/18a22f1939c9da652c8eb7259dd078d5d3e04dab))
* bundle the web-tree-sitter instead of ignore it inside .vscodeignore ([b2174eb](https://github.com/unit-mesh/auto-dev-vscode/commit/b2174eb3b052fa67b7cb15c7dc2ccbb0bc0dce34))
* Bundled production dependency ([df49135](https://github.com/unit-mesh/auto-dev-vscode/commit/df491353366bf063aa4a9abc582062414c548352))
* **chat-context:** handle target file type check more robustly ([4d67e2a](https://github.com/unit-mesh/auto-dev-vscode/commit/4d67e2adf13effba98202c5b67f75175c4ee3141))
* **codesearch:** remove console.debug statements and add getText() method to TextRange class ([0b04f55](https://github.com/unit-mesh/auto-dev-vscode/commit/0b04f5577bebba040cbbf54f6a9d26f4eb8eb12b))
* **codesearch:** simplify for test logic ([033082f](https://github.com/unit-mesh/auto-dev-vscode/commit/033082ff75e99dee0678337731ce67e3694cb691))
* ERROR deps not found ([a889400](https://github.com/unit-mesh/auto-dev-vscode/commit/a8894005b083e8a6b3f03aea627fce58ead22a0f))
* fix async issue ([954fdbe](https://github.com/unit-mesh/auto-dev-vscode/commit/954fdbefac873d6d90326ebfa681cd7eb4641115))
* Fix ci failures ([5856f90](https://github.com/unit-mesh/auto-dev-vscode/commit/5856f9034cad5fdf93c94f1a5d345c50b70a6fb1))
* fix for CI ([e862bc2](https://github.com/unit-mesh/auto-dev-vscode/commit/e862bc24108966e3b7438dfbfb77ec2745000144))
* fix import ([a2f5af2](https://github.com/unit-mesh/auto-dev-vscode/commit/a2f5af287532b86ec5b0af33f9a2872ddc675da2))
* fix issue ([f6ee6dd](https://github.com/unit-mesh/auto-dev-vscode/commit/f6ee6dd400cac4f02df61cfcdee47ac6f91831a0))
* fix package name issue ([978175d](https://github.com/unit-mesh/auto-dev-vscode/commit/978175dc4f5e3b3918ff355d191bfd36a441251b))
* fix symlink ([2546782](https://github.com/unit-mesh/auto-dev-vscode/commit/2546782a8e5fe6eddc9022e0a03b1f21e6c982e1))
* fix tests ([69df684](https://github.com/unit-mesh/auto-dev-vscode/commit/69df684f4897f29bf8f9f45745e39930be488145))
* fix typos ([3bc79da](https://github.com/unit-mesh/auto-dev-vscode/commit/3bc79da98857bb5729afeb4182dcdbaa666038e6))
* fix typos ([80bde6e](https://github.com/unit-mesh/auto-dev-vscode/commit/80bde6ea39189b26c9914562fa542b4c7f11c0dd))
* fix typos ([3f63e0e](https://github.com/unit-mesh/auto-dev-vscode/commit/3f63e0eef9730b03188ac5e5c72e205a0b4636f3))
* gui-sidebar loading ([e054184](https://github.com/unit-mesh/auto-dev-vscode/commit/e054184eefcaa0f1140f238237816647052b0e7a))
* **gui-sidebar:** it builds now ([cf4c0c0](https://github.com/unit-mesh/auto-dev-vscode/commit/cf4c0c052955209e1ea62b16130c56eac187fcaf))
* ignore gui-sidebar when packaging vscode extension ([5a88081](https://github.com/unit-mesh/auto-dev-vscode/commit/5a88081ba698108afd93035607eb884ee7b415e1))
* Ignore static loading of wasm files ([51a5663](https://github.com/unit-mesh/auto-dev-vscode/commit/51a56632a670ff000ad44e653f46519fdf8b36a1))
* more core shims ([053bd10](https://github.com/unit-mesh/auto-dev-vscode/commit/053bd1090506a6ffa46269167400aebadd49c011))
* move tree-sitter.wasm ([f2c3e24](https://github.com/unit-mesh/auto-dev-vscode/commit/f2c3e2484c432ac8f09eda4d2f7791d54ed70882))
* move wasm files ([2bceb95](https://github.com/unit-mesh/auto-dev-vscode/commit/2bceb95df8318d2fa77867653eaa7d5430f543c8))
* possiblely wrong ignore syntax in .vscodeignore ([7b389dd](https://github.com/unit-mesh/auto-dev-vscode/commit/7b389dd57bfd535068fff74719ac6a2b8a9c7f2b))
* **prompts:** improve commit message generation and documentation practices [#14](https://github.com/unit-mesh/auto-dev-vscode/issues/14) ([071156a](https://github.com/unit-mesh/auto-dev-vscode/commit/071156ac05ce5ef2f748b6f74c847d342a02ff2a))
* remove .ts extension to fix build ([78636ca](https://github.com/unit-mesh/auto-dev-vscode/commit/78636cadc4ebaabc5fa5b5daec7694c3402178ee))
* some core shims ([9b6567b](https://github.com/unit-mesh/auto-dev-vscode/commit/9b6567bf5300eecef75f48fbbd001ef707ec933f))
* **SpringContextProvider:** update Spring library detection logic [#14](https://github.com/unit-mesh/auto-dev-vscode/issues/14) ([1671bca](https://github.com/unit-mesh/auto-dev-vscode/commit/1671bca0e1a258f625e4d4b0bcefae923f4417a6))
* **test:** refactor hover range tests to use `getText()` method ([a5d652f](https://github.com/unit-mesh/auto-dev-vscode/commit/a5d652fccd9221e90b8e8dd3e04dfe80c7518865))
* update `isActive` method to return `Promise<boolean>` and `getLanguageClient` to return `undefined` in `SemanticLsp` class. [#2](https://github.com/unit-mesh/auto-dev-vscode/issues/2) ([339b4a1](https://github.com/unit-mesh/auto-dev-vscode/commit/339b4a1f38a000a652a1f7c3367354a1ed3a87a0))
* update method signatures and improve code structure parsing in JavaTSConfig and JavaStructurer. [#2](https://github.com/unit-mesh/auto-dev-vscode/issues/2) ([33f02ea](https://github.com/unit-mesh/auto-dev-vscode/commit/33f02ea6e44c3828f5086d37a338018ed8dfff48))
* update method signatures and improve code structure parsing in JavaTSConfig and JavaStructurer. [#2](https://github.com/unit-mesh/auto-dev-vscode/issues/2) ([8919fac](https://github.com/unit-mesh/auto-dev-vscode/commit/8919fac56322f7dcc01750bb3edd02813395edd6))
* vscode engine version ([caf6046](https://github.com/unit-mesh/auto-dev-vscode/commit/caf6046fbc442edab6e27ba236c4b5b5f4bbd1ba))
* web-tree-sitter is not found ([8521574](https://github.com/unit-mesh/auto-dev-vscode/commit/8521574ee34fc19236451647f41642e389dbce2f))
* wrong wasm path ([ba81ca0](https://github.com/unit-mesh/auto-dev-vscode/commit/ba81ca0e6cd685205deefee670adcf8a9c7d0628))


### Features

* **action:** refactor to use VSCodeAction class [#2](https://github.com/unit-mesh/auto-dev-vscode/issues/2) ([1a9ebdb](https://github.com/unit-mesh/auto-dev-vscode/commit/1a9ebdbd65cea459842c132d509d7675c8ed70e0))
* add basic syntax support for ts[#2](https://github.com/unit-mesh/auto-dev-vscode/issues/2) ([d1ab15d](https://github.com/unit-mesh/auto-dev-vscode/commit/d1ab15d926fa76f5ef2f6e4e1617e721e43b9783))
* add go ts config support [#2](https://github.com/unit-mesh/auto-dev-vscode/issues/2) ([9c54c1b](https://github.com/unit-mesh/auto-dev-vscode/commit/9c54c1b52a413cfdc3d4b11b0ded4361bcde61da))
* add Gradle sync support and refactor JavaSemanticLsp import path [#2](https://github.com/unit-mesh/auto-dev-vscode/issues/2) ([1e96422](https://github.com/unit-mesh/auto-dev-vscode/commit/1e964227a957754f3ed91de83d72a6936bd343a9))
* add hover for class level quick fix [#12](https://github.com/unit-mesh/auto-dev-vscode/issues/12) ([e532f85](https://github.com/unit-mesh/auto-dev-vscode/commit/e532f8577178dd17fffa669a71adec1ce0cd27bd))
* add Java structure support with TreeSitter-Java and vscode-pylance integration [#2](https://github.com/unit-mesh/auto-dev-vscode/issues/2) ([3f37385](https://github.com/unit-mesh/auto-dev-vscode/commit/3f37385bde56681257a840927090457e4bdeff87))
* Add method input and output query expression support for Java [#2](https://github.com/unit-mesh/auto-dev-vscode/issues/2) ([effe75e](https://github.com/unit-mesh/auto-dev-vscode/commit/effe75e1dc0dec8d05878fcad63f84785bcab99c))
* add more basic from continue ([55bf890](https://github.com/unit-mesh/auto-dev-vscode/commit/55bf890e0b3e679253fc928a7af26f6bf88a89bd))
* add PythonSemanticLsp class with support for vscode-pylance and TreeSitterFile method. [#2](https://github.com/unit-mesh/auto-dev-vscode/issues/2) ([3fb3205](https://github.com/unit-mesh/auto-dev-vscode/commit/3fb3205eced223609ee748dfd4d3e1746b378b9e))
* add support for Go and TypeScript with TreeSitter-Go and TreeSitter-TypeScript integration [#2](https://github.com/unit-mesh/auto-dev-vscode/issues/2) ([b79c28f](https://github.com/unit-mesh/auto-dev-vscode/commit/b79c28fb411e1aac5408478d1dc7cf9ef8c14c03))
* add version propertie ([95a5592](https://github.com/unit-mesh/auto-dev-vscode/commit/95a5592115fdac00decdb964fc78a18e6178fb70))
* **agent:** introduce AutoPage and related components for frontend workflow [#9](https://github.com/unit-mesh/auto-dev-vscode/issues/9) ([562bd3d](https://github.com/unit-mesh/auto-dev-vscode/commit/562bd3d8a105aae11d810a0a3bcc60c9647d000b))
* **agent:** introduce AutoPage and related components for frontend workflow [#9](https://github.com/unit-mesh/auto-dev-vscode/issues/9) ([2ff4111](https://github.com/unit-mesh/auto-dev-vscode/commit/2ff4111ba0751788fdbb65c874a8e5d0c29904ab))
* **agent:** introduce CustomAgentConfig and related classes for custom agent configuration [#9](https://github.com/unit-mesh/auto-dev-vscode/issues/9) ([3d5e505](https://github.com/unit-mesh/auto-dev-vscode/commit/3d5e505fce35d99bfcfb06033693b5d8dc56c9f2))
* **agent:** introduce CustomAgentConfig and related classes for custom agent configuration [#9](https://github.com/unit-mesh/auto-dev-vscode/issues/9) ([3af4f76](https://github.com/unit-mesh/auto-dev-vscode/commit/3af4f767790f480f45f9631ee4244b1c7f1adf05))
* **agent:** refactor CustomAgentConfig and introduce new types and enums for improved configuration and interaction handling [#9](https://github.com/unit-mesh/auto-dev-vscode/issues/9) ([d43da94](https://github.com/unit-mesh/auto-dev-vscode/commit/d43da94209d5cbede80f42a096dfb2010de1ef2e))
* autodev ui init ([9949d25](https://github.com/unit-mesh/auto-dev-vscode/commit/9949d25a16c2e3f1e9adabccf2aa929026b3700f))
* **autodev:** add auto test feature for method and class in TypeScript and Java files. ([e89db11](https://github.com/unit-mesh/auto-dev-vscode/commit/e89db117549a4bc2d3b80105c89dd0baad462211))
* **autodev:** add new commands and context menu for quick chat and terminal selection ([aa98047](https://github.com/unit-mesh/auto-dev-vscode/commit/aa980476554c3351254e5d36e01e6a979c8727b4))
* **autodev:** refactor commands and add support for generating API data from code blocks [#2](https://github.com/unit-mesh/auto-dev-vscode/issues/2) ([28cce71](https://github.com/unit-mesh/auto-dev-vscode/commit/28cce71a7c8305cd08d9991dfba29910d5eef560))
* **buildtool:** add moduleTarget property and implement lookupRelativeTooling method for Gradle and NpmTooling classes [#9](https://github.com/unit-mesh/auto-dev-vscode/issues/9) ([b057bd6](https://github.com/unit-mesh/auto-dev-vscode/commit/b057bd63891379df6c2a0541c10982b1cedfe163))
* **buildtool:** refactor Gradle dependency detection and add ToolingDetector class [#2](https://github.com/unit-mesh/auto-dev-vscode/issues/2) ([564f876](https://github.com/unit-mesh/auto-dev-vscode/commit/564f876525a451a3df59c3848baa5430e128a092))
* **buildtool:** refactor GradleSync to use PackageDependencies ([e434c42](https://github.com/unit-mesh/auto-dev-vscode/commit/e434c427df2b73d89e117612ff3bfe24cad97109))
* cache extension context ([36a7e77](https://github.com/unit-mesh/auto-dev-vscode/commit/36a7e778ded9360ccdad3f93e351ec6fc01b27f2))
* **cache-manager:** introduce singleton pattern for TreeSitterFileCacheManager [#12](https://github.com/unit-mesh/auto-dev-vscode/issues/12) ([fd5fd78](https://github.com/unit-mesh/auto-dev-vscode/commit/fd5fd78f4cea5f726d61704e2a060d8abb36cd2a))
* **cache:** refactor and introduce new cache manager for TreeSitterFile objects [#2](https://github.com/unit-mesh/auto-dev-vscode/issues/2) ([7c683ba](https://github.com/unit-mesh/auto-dev-vscode/commit/7c683ba4022b8f53961139dfc7a90ccf269f8249))
* **chat-context/tooling:** refactor GradleTooling to BuildToolProvider and add NpmBuildToolProvider [#14](https://github.com/unit-mesh/auto-dev-vscode/issues/14) ([07b4e1a](https://github.com/unit-mesh/auto-dev-vscode/commit/07b4e1a3f943917952d2a5b0f71ff108bddd0c3d))
* **chat-context:** add JavaScriptContextProvider and refactor JsDependenciesSnapshot creation logic [#14](https://github.com/unit-mesh/auto-dev-vscode/issues/14) ([dff4917](https://github.com/unit-mesh/auto-dev-vscode/commit/dff4917dc2d46a616dee7f32576bd5857a853044))
* **chat-context:** add JavaSdkVersionProvider and JavaScriptContextProvider ([d732b5b](https://github.com/unit-mesh/auto-dev-vscode/commit/d732b5bd0bfe9e8dfcaf8e6b34e7807b1fd1486c))
* **chat-context:** introduce GradleTooling singleton and refactor dependency detection logic in ToolingDetector [#14](https://github.com/unit-mesh/auto-dev-vscode/issues/14) ([1ea0d53](https://github.com/unit-mesh/auto-dev-vscode/commit/1ea0d53ce5fb6151a73a90a1bdc1d44f1a014a4d))
* **chat-context:** refactor chat context collection into ChatContextManager class [#14](https://github.com/unit-mesh/auto-dev-vscode/issues/14) ([0050e13](https://github.com/unit-mesh/auto-dev-vscode/commit/0050e13ac272e183a8f0dd942eadcd669755ca9c))
* **chat-context:** refactor ChatContextProvider and add SpringContextProvider support [#14](https://github.com/unit-mesh/auto-dev-vscode/issues/14) ([ce8cb83](https://github.com/unit-mesh/auto-dev-vscode/commit/ce8cb83ddee7d765e82fd974c9e18eab150a0b92))
* **chat-context:** refactor isApplicable methods to return promises and use GradleTooling instance [#14](https://github.com/unit-mesh/auto-dev-vscode/issues/14) ([7dcf329](https://github.com/unit-mesh/auto-dev-vscode/commit/7dcf32918c53ad7227e389680296e82b1986314a))
* **chat-context:** refactor tooling detection ([7dd05f7](https://github.com/unit-mesh/auto-dev-vscode/commit/7dd05f776da5c5152f7fe58c8f37041616391d30))
* **ci:** add coverage reporting to GitHub workflows ([7d1065a](https://github.com/unit-mesh/auto-dev-vscode/commit/7d1065a72e483ac757fd0764ee56b193c4448bdd))
* **code-actions:** improve method range detection in TreeSitterFile [#9](https://github.com/unit-mesh/auto-dev-vscode/issues/9) ([0497965](https://github.com/unit-mesh/auto-dev-vscode/commit/0497965a24cf996f1aac0062035d92df71d75d38))
* **code-context:** add support for Java and TypeScript test generation providers [#12](https://github.com/unit-mesh/auto-dev-vscode/issues/12) ([939f2db](https://github.com/unit-mesh/auto-dev-vscode/commit/939f2dbdac8b859f733665a9255f3ee165ee9e77))
* **code-context:** add TypeScriptTestGenProvider and update BuildToolProvider mapping [#12](https://github.com/unit-mesh/auto-dev-vscode/issues/12) ([b17609e](https://github.com/unit-mesh/auto-dev-vscode/commit/b17609e6bc9f27cce7d4ca623efc52d296649cf8))
* **code-context:** refactor structurer and add base structurer class [#12](https://github.com/unit-mesh/auto-dev-vscode/issues/12) ([cd2d3b0](https://github.com/unit-mesh/auto-dev-vscode/commit/cd2d3b003666b5be1abbc5e40a7b517aa18b5ec3))
* **code-context:** refactor structurer and related providers to use web-tree-sitter library and improve code parsing and generation [#12](https://github.com/unit-mesh/auto-dev-vscode/issues/12) ([36e9295](https://github.com/unit-mesh/auto-dev-vscode/commit/36e92950b06d6a2e2670773f28bc50e6cd5dccdc))
* **code-context:** refactor structurer providers and add language applicability checks [#12](https://github.com/unit-mesh/auto-dev-vscode/issues/12) ([26f2bc5](https://github.com/unit-mesh/auto-dev-vscode/commit/26f2bc5660bd63528d5fb57f5c5b6b92cdd35aa3))
* **code-context:** refactor TreeSitterFile and add ScopeGraph support ([d99cd92](https://github.com/unit-mesh/auto-dev-vscode/commit/d99cd92c29106b9cd09414d68a1207813653774b))
* **code-search:** refactor ScopeGraph to return arrays instead of iterables [#12](https://github.com/unit-mesh/auto-dev-vscode/issues/12) ([a04e2ac](https://github.com/unit-mesh/auto-dev-vscode/commit/a04e2acfd4f0f55d2b4b7955360f4790790d5d93))
* **codemodel:** add PlantUML support for code structure visualization [#2](https://github.com/unit-mesh/auto-dev-vscode/issues/2) ([94622a9](https://github.com/unit-mesh/auto-dev-vscode/commit/94622a9497ea58635a657759503751e55d4e92fe))
* **codemodel:** introduce dependency and package metadata system [#2](https://github.com/unit-mesh/auto-dev-vscode/issues/2) ([a0fabd2](https://github.com/unit-mesh/auto-dev-vscode/commit/a0fabd2ffb85a4a45384f28be9977a1e5dbd12e3))
* **codemodel:** refactor and centralize provider registration [#2](https://github.com/unit-mesh/auto-dev-vscode/issues/2) ([6fe8b75](https://github.com/unit-mesh/auto-dev-vscode/commit/6fe8b7594b5c39afb5bd8aae401275cf2a87ce90))
* **codesearch:** add AI-based codesearch functionality using SSE and streamResponse. ([82bd86b](https://github.com/unit-mesh/auto-dev-vscode/commit/82bd86ba4ba91262524dd0a507726f23ccec74fe))
* **codesearch:** add basic insert local scope support ([34ec2f6](https://github.com/unit-mesh/auto-dev-vscode/commit/34ec2f6b37fbef595f090b9cf401e937f99df1b8))
* **codesearch:** add more implementation for insert local ([2157dd6](https://github.com/unit-mesh/auto-dev-vscode/commit/2157dd6272f2545f600956d3da0102628518e666))
* **codesearch:** add ScopeBuilder class and related models ([065c315](https://github.com/unit-mesh/auto-dev-vscode/commit/065c315eeae38e694509037cb3489cc7decdb991))
* **codesearch:** add ScopeDebug class for detailed scope analysis and debugging. ([7aa763a](https://github.com/unit-mesh/auto-dev-vscode/commit/7aa763a21f890e72a2760f96cbbfa5c65b9cd843))
* **codesearch:** add ScopeGraph and related classes for improved reference resolution and symbol indexing. ([164b70e](https://github.com/unit-mesh/auto-dev-vscode/commit/164b70efece1633c1d630f3943c927821ed26210))
* **codesearch:** add TextRange compare and sort methods ([cd25354](https://github.com/unit-mesh/auto-dev-vscode/commit/cd253549709069781a975a3062869be6a009c06d))
* **codesearch:** extract for scope debug util ([e2a21ba](https://github.com/unit-mesh/auto-dev-vscode/commit/e2a21ba5c77ed50632bfdd82e044bb5bd1eb4d1d))
* **codesearch:** introduce ScopeBuilder and related models for efficient symbol indexing and referencing [#9](https://github.com/unit-mesh/auto-dev-vscode/issues/9) ([9cd0a93](https://github.com/unit-mesh/auto-dev-vscode/commit/9cd0a9356600e7042604872d26a9c9240a804d1c))
* **codesearch:** introduce ScopeBuilder and related models for efficient symbol indexing and referencing [#9](https://github.com/unit-mesh/auto-dev-vscode/issues/9) ([0fdd0b0](https://github.com/unit-mesh/auto-dev-vscode/commit/0fdd0b0d4d876d546d9ed9d8d04912e5298706d8))
* **codesearch:** introduce ScopeBuilder and related models for efficient symbol indexing and referencing [#9](https://github.com/unit-mesh/auto-dev-vscode/issues/9) ([be5799f](https://github.com/unit-mesh/auto-dev-vscode/commit/be5799f1ce76689a60808a39e4d95e9f823767d5))
* **codesearch:** introduce ScopeBuilder and related models for efficient symbol indexing and referencing [#9](https://github.com/unit-mesh/auto-dev-vscode/issues/9) ([9e24bde](https://github.com/unit-mesh/auto-dev-vscode/commit/9e24bded0d06f1191ef258064ab864589b3e406b))
* **codesearch:** refactor LocalScope to use ScopeGraph for context extraction ([1096e21](https://github.com/unit-mesh/auto-dev-vscode/commit/1096e21d4e978b6c68dba0779037231b96d206e5))
* **codesearch:** refactor ScopeBuilder and related classes for improved symbol indexing and referencing. [#9](https://github.com/unit-mesh/auto-dev-vscode/issues/9) ([0f8472b](https://github.com/unit-mesh/auto-dev-vscode/commit/0f8472b60f55588cb073c2a30db5def82401ee43))
* **codesearch:** refactor ScopeBuilder and ScopeGraph for improved logging and node handling [#2](https://github.com/unit-mesh/auto-dev-vscode/issues/2) ([6bb2995](https://github.com/unit-mesh/auto-dev-vscode/commit/6bb2995c2f5ef236ad44c2121c18689d2eb4eb35))
* **codesearch:** refactor ScopeBuilder and ScopeGraph for improved logging and node handling [#9](https://github.com/unit-mesh/auto-dev-vscode/issues/9) ([083ec96](https://github.com/unit-mesh/auto-dev-vscode/commit/083ec96bcfd250b715a79cd28a47217351b97fd4))
* **codesearch:** refactor ScopeBuilder for improved capture handling and logging ([b372bce](https://github.com/unit-mesh/auto-dev-vscode/commit/b372bce266de5a7136071c8f5068501f2c22507d))
* **codesearch:** refactor ScopeBuilder for improved capture handling and logging ([8335a2c](https://github.com/unit-mesh/auto-dev-vscode/commit/8335a2c7ffbc6e6320c2ba92cc00027530834bcf))
* **codesearch:** refactor ScopeBuilder for Java with improved capture handling and logging. ([896c3bd](https://github.com/unit-mesh/auto-dev-vscode/commit/896c3bd9ddb8d3573beb917655921202a15f31c9))
* **codesearch:** refactor ScopeGraph to use Graphology and improve logging ([ccce9c8](https://github.com/unit-mesh/auto-dev-vscode/commit/ccce9c8f56f138f987b157c7b996c5ae94d4c577))
* **codesearch:** refactor ScopeGraph to use rootIndex for improved consistency and scope resolution. ([42e521c](https://github.com/unit-mesh/auto-dev-vscode/commit/42e521c4bae37c8d6559bf6daacd7d01eee14c60))
* **codesearch:** refactor ScopeGraph to use rootIndex for improved consistency and scope resolution. ([5aa1e79](https://github.com/unit-mesh/auto-dev-vscode/commit/5aa1e7913b1fa909510d00b92fc45b43de8cce78))
* **codesearch:** refactor ScopeGraph to use rootIndex for improved consistency and scope resolution. ([8c076bf](https://github.com/unit-mesh/auto-dev-vscode/commit/8c076bfb8d1505f4d60fc3f8ac53bc1c17707028))
* **codesearch:** refactor SymbolId and LocalDef classes, add WebViewProvider registration [#9](https://github.com/unit-mesh/auto-dev-vscode/issues/9) ([a88d3a5](https://github.com/unit-mesh/auto-dev-vscode/commit/a88d3a5c5a6f428ff70711ce00c79b0361f329c1))
* **codesearch:** refactor TextRange compare and sort methods, add context extraction for source code analysis ([95c8818](https://github.com/unit-mesh/auto-dev-vscode/commit/95c8818024e7eaff36da92bfdfdcfb12a6df7163))
* **commands:** add AutoTestAction and refactor AutoDocAction to implement Action interface [#12](https://github.com/unit-mesh/auto-dev-vscode/issues/12) ([374895d](https://github.com/unit-mesh/auto-dev-vscode/commit/374895dd4ff4bb73c24f9a2865e3dadb56600dc5))
* **comment-parsing:** add support for block comments in UML diagrams [#9](https://github.com/unit-mesh/auto-dev-vscode/issues/9) ([03b107d](https://github.com/unit-mesh/auto-dev-vscode/commit/03b107da06e13c97e2e35d77dd8d25069dc7a54b))
* **comment-parsing:** use line-specific comment symbols for better comment extraction in UML diagrams [#9](https://github.com/unit-mesh/auto-dev-vscode/issues/9) ([ade2686](https://github.com/unit-mesh/auto-dev-vscode/commit/ade2686746b762580a58158795afa623df525c02))
* **container:** add TypeScript support and refactor provider container structure [#12](https://github.com/unit-mesh/auto-dev-vscode/issues/12) ([7931d9d](https://github.com/unit-mesh/auto-dev-vscode/commit/7931d9d6f4c4d89b78bbde19e116e97d40283641))
* **custom-action/variable:** refactor BuiltinVariables to enum and add FrameworkVariableProvider and VariableResolver classes. ([649ea7d](https://github.com/unit-mesh/auto-dev-vscode/commit/649ea7d868fc53e19ebfa1a406f5886d801dcd43))
* **custom-action:** add built-in variables and their provider ([8a48b20](https://github.com/unit-mesh/auto-dev-vscode/commit/8a48b206ecd1b87c9e57506d0e4e62c282768c8d))
* **docs:** add documentation for adding new language support ([b7b097b](https://github.com/unit-mesh/auto-dev-vscode/commit/b7b097b2617c1a289acda73d2f695070a8e03cf6))
* **docs:** update repository URL, license, and documentation for VSCode extension ([03bae9e](https://github.com/unit-mesh/auto-dev-vscode/commit/03bae9eeade1f120d168d550eebae30a8f84babc))
* **documentation:** Improve user documentation generation for specified language code. [#9](https://github.com/unit-mesh/auto-dev-vscode/issues/9) ([59e985c](https://github.com/unit-mesh/auto-dev-vscode/commit/59e985cf094f4a3fb46829c05efb2e4d0549669a))
* **editor-api:** refactor and add new editor-api actions and notifications [#9](https://github.com/unit-mesh/auto-dev-vscode/issues/9) ([fe55650](https://github.com/unit-mesh/auto-dev-vscode/commit/fe55650c1fd2ac1e7f4dd3828103e0655db423b8))
* **editor:** introduce AutoDevStatusManager and refactor status notification handling in VSCode extension. ([1e0932d](https://github.com/unit-mesh/auto-dev-vscode/commit/1e0932dd2c5d117d6b334cc761fd1f195a5f2e6e))
* **editor:** introduce CodeElement interface and add ChatContextProvider class [#14](https://github.com/unit-mesh/auto-dev-vscode/issues/14) ([18e3ac0](https://github.com/unit-mesh/auto-dev-vscode/commit/18e3ac0797bda4e9c647a3ea4662a4d87d327f99))
* extract insertCodeByRange function  [#2](https://github.com/unit-mesh/auto-dev-vscode/issues/2) ([92b3f64](https://github.com/unit-mesh/auto-dev-vscode/commit/92b3f6448597af90b38bdf676584d8cdf79e9231))
* **gradle-build-tool:** replace util.TextDecoder with TextDecoder for compatibility ([770c8ac](https://github.com/unit-mesh/auto-dev-vscode/commit/770c8ac5d87e9516dc46d23c09960339e70deacf))
* **gradle-tooling:** add support for Kotlin build scripts and improve applicability check ([4ce01e2](https://github.com/unit-mesh/auto-dev-vscode/commit/4ce01e24f3d33ac6441f4f17e548833735150ae9))
* **gradle:** add Gradle version info parsing and SDK version provider for Java projects [#14](https://github.com/unit-mesh/auto-dev-vscode/issues/14) ([0f11c92](https://github.com/unit-mesh/auto-dev-vscode/commit/0f11c92317276e5ae3c590b0309660829a04cb0b))
* init auto doc ([b8a9f0d](https://github.com/unit-mesh/auto-dev-vscode/commit/b8a9f0dfaaa69e44e83d5e193e0619b81715018d))
* init auto doc ([95ab70d](https://github.com/unit-mesh/auto-dev-vscode/commit/95ab70d35e4a040951a9ad1de06b10f7a4d651ee))
* init lsp api for java ([d150001](https://github.com/unit-mesh/auto-dev-vscode/commit/d1500019a9fe3b3c6fb85fdd39b1fe23ae5fa759))
* init status event [#2](https://github.com/unit-mesh/auto-dev-vscode/issues/2) ([51488fc](https://github.com/unit-mesh/auto-dev-vscode/commit/51488fc869eb19b47627e7b6d14006e54a2fbb6e))
* init toolbar ([9df0263](https://github.com/unit-mesh/auto-dev-vscode/commit/9df0263ae42fecee4ec5a559e43d6942d05160e5))
* init treesiterr lang [#2](https://github.com/unit-mesh/auto-dev-vscode/issues/2) ([002feb1](https://github.com/unit-mesh/auto-dev-vscode/commit/002feb19dbc96d30180a3a38175810d164908026))
* Introduce RecentlyDocumentManager class with improved document management features. [#2](https://github.com/unit-mesh/auto-dev-vscode/issues/2) ([ffbc285](https://github.com/unit-mesh/auto-dev-vscode/commit/ffbc2855108303fed6e90aafc21bf467492f41ab))
* introducing root.ts ([0f66fc8](https://github.com/unit-mesh/auto-dev-vscode/commit/0f66fc8e65c2f932863686143dab7db00c496a32))
* **java-parser:** add support for parsing method return types and names in Java files [#2](https://github.com/unit-mesh/auto-dev-vscode/issues/2) ([14c94a8](https://github.com/unit-mesh/auto-dev-vscode/commit/14c94a8453b72161538df71a88b07e67a264dbb8))
* **java-parser:** introduce JavaStructureParser and refactor methodRanges logic in AutoDevActionProvider [#2](https://github.com/unit-mesh/auto-dev-vscode/issues/2) ([973672e](https://github.com/unit-mesh/auto-dev-vscode/commit/973672e11394848116a17902423f1aec15e0e749))
* **java-parser:** refactor JavaStructureParser to JavaStructurer and update tests and providers to use the new class [#2](https://github.com/unit-mesh/auto-dev-vscode/issues/2) ([e16cc00](https://github.com/unit-mesh/auto-dev-vscode/commit/e16cc004f9be164a1e70d3b4c5ea5aeeb4a78033))
* **java-test-gen:** add Java specific test generation logic and utilities [#12](https://github.com/unit-mesh/auto-dev-vscode/issues/12) ([8620471](https://github.com/unit-mesh/auto-dev-vscode/commit/8620471bcab3b6f0044677f70ffa75eb881f24c9))
* **java:** add JavaTestGenProvider and related initialization logic. ([ee76c56](https://github.com/unit-mesh/auto-dev-vscode/commit/ee76c56e7f8f208345dd59e85259fb6a85bd02cc))
* **javascript-dependencies:** add JsDependenciesSnapshot class and related utilities [#9](https://github.com/unit-mesh/auto-dev-vscode/issues/9) ([5a154ff](https://github.com/unit-mesh/auto-dev-vscode/commit/5a154ff6b6d94c9e0e2ece902abb63ba689c2422))
* **javascript:** refactor dependency type handling and update web/test framework enum values [#14](https://github.com/unit-mesh/auto-dev-vscode/issues/14) ([6cae62b](https://github.com/unit-mesh/auto-dev-vscode/commit/6cae62b92d45a82a8ced91c6520d80b15e83855a))
* **JavaTestGenProvider:** use i18n for prompts and update test code template instructions ([d2c41e5](https://github.com/unit-mesh/auto-dev-vscode/commit/d2c41e5f68203c40598404e0a1daac8e36418b65))
* **java:** update JavaScriptLangConfig test with new grammar and logger [#2](https://github.com/unit-mesh/auto-dev-vscode/issues/2) ([a7a08e6](https://github.com/unit-mesh/auto-dev-vscode/commit/a7a08e6cea5c0142464eaed81a70ac5d0dc4816b))
* **l10n:** use vscode's l10n module for i18n support in code lenses and test generation prompts. ([863f117](https://github.com/unit-mesh/auto-dev-vscode/commit/863f11766c237f564cd5bdbb59695e56604da545))
* **llm-provider:** add LlmProvider class and refactor OpenAICompletion class to use it [#9](https://github.com/unit-mesh/auto-dev-vscode/issues/9) ([5a4548a](https://github.com/unit-mesh/auto-dev-vscode/commit/5a4548a395c00979be4ed27445759128466f8766))
* **llm-provider:** introduce ChatMessage class and refactor related components to use it [#9](https://github.com/unit-mesh/auto-dev-vscode/issues/9) ([08c9388](https://github.com/unit-mesh/auto-dev-vscode/commit/08c9388b0927495364757431dacf8c51de5d5a78))
* **markdown:** add PostCodeProcessor test suite [#2](https://github.com/unit-mesh/auto-dev-vscode/issues/2) ([d06b56d](https://github.com/unit-mesh/auto-dev-vscode/commit/d06b56dc5d5097a2ec0e7153b52b04069bbf5c0a))
* **markdown:** refactor code block processing and add support for auto-documenting code blocks ([fab7130](https://github.com/unit-mesh/auto-dev-vscode/commit/fab7130b6c2c756cb2e0c8189270414a89ee8873))
* **model:** refactor code structure and add PlantUML presenter support [#2](https://github.com/unit-mesh/auto-dev-vscode/issues/2) ([07159f9](https://github.com/unit-mesh/auto-dev-vscode/commit/07159f962659f850d09a51524044d0f4dbe5b1ed))
* **model:** refactor code structure and add PlantUML presenter support [#2](https://github.com/unit-mesh/auto-dev-vscode/issues/2) ([ef88aab](https://github.com/unit-mesh/auto-dev-vscode/commit/ef88aab20413060a8d9e6b5bfa5d882536956b3c))
* **npm:** add moduleTarget property and implement lookupRelativeTooling method for NpmTooling class [#9](https://github.com/unit-mesh/auto-dev-vscode/issues/9) ([273c09b](https://github.com/unit-mesh/auto-dev-vscode/commit/273c09bf6dcf081307b16fdd1071f74ef09d6156))
* **parser:** add FencedCode parsing and language detection system [#2](https://github.com/unit-mesh/auto-dev-vscode/issues/2) ([91bf5d2](https://github.com/unit-mesh/auto-dev-vscode/commit/91bf5d2643c142b4523be29af19c1403b9ec296f))
* **parser:** add support for TypeScript React files [#9](https://github.com/unit-mesh/auto-dev-vscode/issues/9) ([5917ac6](https://github.com/unit-mesh/auto-dev-vscode/commit/5917ac641f6e6fc8928eac6c38851aabeb6362f6))
* **parser:** add support for TypeScript React files [#9](https://github.com/unit-mesh/auto-dev-vscode/issues/9) ([0f08dad](https://github.com/unit-mesh/auto-dev-vscode/commit/0f08dad65570403ca1bd85ad24f0252464da85eb))
* **parser:** fix go in older way ([3781374](https://github.com/unit-mesh/auto-dev-vscode/commit/378137441c68416ba215544109066039856a93dc))
* **parser:** refactor FencedCode parsing and add PostCodeProcessor class for code formatting [#2](https://github.com/unit-mesh/auto-dev-vscode/issues/2) ([251c7f6](https://github.com/unit-mesh/auto-dev-vscode/commit/251c7f6af828f04a3deecb6582a75ffc76a7a00e))
* **parser:** refactor method and class ranges query and add support for TypeScript React files [#9](https://github.com/unit-mesh/auto-dev-vscode/issues/9) ([b964447](https://github.com/unit-mesh/auto-dev-vscode/commit/b96444795ca0a01266dedcbcd69ab58a1b9af973))
* **parser:** refactor method and class ranges query and add support for TypeScript React files [#9](https://github.com/unit-mesh/auto-dev-vscode/issues/9) ([d8e4b1a](https://github.com/unit-mesh/auto-dev-vscode/commit/d8e4b1abf98486a825e6aacc4fb0ad33c0d49bba))
* **prompt-manage:** add new template loading functionality [#7](https://github.com/unit-mesh/auto-dev-vscode/issues/7) ([1f3fdb9](https://github.com/unit-mesh/auto-dev-vscode/commit/1f3fdb9cc4502c7c8801de12d031eaaed3c42d74))
* **prompt-manage:** add team prompts system and related classes [#9](https://github.com/unit-mesh/auto-dev-vscode/issues/9) ([4ca30b2](https://github.com/unit-mesh/auto-dev-vscode/commit/4ca30b2c3cc9b0f29c8da1a05a5f1e37018ccf3a))
* **prompt-manage:** add unit tests for CustomActionPrompt and refactor parsing logic to use js-yaml [#9](https://github.com/unit-mesh/auto-dev-vscode/issues/9) ([c9d04b6](https://github.com/unit-mesh/auto-dev-vscode/commit/c9d04b689ea8ce71c986a9b583d9c9b6bc4f5fe7))
* **prompt-manager:** add chat context support for template prompts [#14](https://github.com/unit-mesh/auto-dev-vscode/issues/14) ([e2c06f8](https://github.com/unit-mesh/auto-dev-vscode/commit/e2c06f8d2d3655b66d37f4c97d0ce8142462309f))
* **prompt-manager:** add ChatContextManager integration ([156463d](https://github.com/unit-mesh/auto-dev-vscode/commit/156463d5d5175fab109fef33e1122a94f97f7c16))
* **prompt-manager:** add support for template rendering and management [#9](https://github.com/unit-mesh/auto-dev-vscode/issues/9) ([69fb97d](https://github.com/unit-mesh/auto-dev-vscode/commit/69fb97d4c5d09819060d6d24c979b741f2528311))
* **providers:** refactor AutoDevActionProvider and AutoDevCodeLensProvider to use new BlockBuilder.buildMethod() and buildClass() methods. [#12](https://github.com/unit-mesh/auto-dev-vscode/issues/12) ([cb223bc](https://github.com/unit-mesh/auto-dev-vscode/commit/cb223bc745abe40447d74726ce66f729e3beb614))
* **quick-chat:** add quick chat feature using vscode QuickInput API [#2](https://github.com/unit-mesh/auto-dev-vscode/issues/2) ([e2c737b](https://github.com/unit-mesh/auto-dev-vscode/commit/e2c737b6cdeae1849d38328a5666167f854d965b))
* refactor JavaConfig and AutoDevActionProvider to use new TreeSitterFile methods for method and class ranges [#2](https://github.com/unit-mesh/auto-dev-vscode/issues/2) ([9e394ad](https://github.com/unit-mesh/auto-dev-vscode/commit/9e394adda955e0a81145030f02b2091e722bdb99))
* Rename and modify files to use TechStack class instead of TestStack class [#14](https://github.com/unit-mesh/auto-dev-vscode/issues/14) ([9efc939](https://github.com/unit-mesh/auto-dev-vscode/commit/9efc9396f23e1709602fd3eaa363ed5e3b8843a6))
* **scope-search:** add allImports method and refactor context function [#12](https://github.com/unit-mesh/auto-dev-vscode/issues/12) ([be7ad6c](https://github.com/unit-mesh/auto-dev-vscode/commit/be7ad6c036574bf3abad2a74b83fa6a56195b924))
* **ScopeGraph:** introduce NodeIndex and refactor graph traversal methods ([0ac36ab](https://github.com/unit-mesh/auto-dev-vscode/commit/0ac36abc1c526be380060aa4e2fe12c1454bcd4b))
* **semantic-treesitter:** add support for Java structure parsing and testing [#2](https://github.com/unit-mesh/auto-dev-vscode/issues/2) ([fc8b3f9](https://github.com/unit-mesh/auto-dev-vscode/commit/fc8b3f93edc633262e0318f7f4cf30136ac6b4c2))
* **semantic-treesitter:** improve Java structure parsing and testing [#2](https://github.com/unit-mesh/auto-dev-vscode/issues/2) ([24c6853](https://github.com/unit-mesh/auto-dev-vscode/commit/24c6853428fe9b4391ceeb0258dda7074da73f25))
* **semantic-treesitter:** introduce StructureParser class and refactor JavaStructure to use it [#2](https://github.com/unit-mesh/auto-dev-vscode/issues/2) ([a3658a0](https://github.com/unit-mesh/auto-dev-vscode/commit/a3658a077a0b86a85aac5ccab5850b8ea36c22d6))
* **semantic-treesitter:** introduce StructureParser class and refactor JavaStructure to use it [#2](https://github.com/unit-mesh/auto-dev-vscode/issues/2) ([5bec11a](https://github.com/unit-mesh/auto-dev-vscode/commit/5bec11aa9c48341a994826daa168ed2690ac0204))
* **semantic-treesitter:** introduce StructureProvider and refactor AutoDevActionProvider to use it [#2](https://github.com/unit-mesh/auto-dev-vscode/issues/2) ([170852a](https://github.com/unit-mesh/auto-dev-vscode/commit/170852a02230538fb711c2bbfc726136b17ea9d2))
* **semantic-treesitter:** refactor and improve TreeSitter language configuration and structurer support by introducing a new TSLanguageService class and updating related components to use it. This commit also includes renaming and refactoring the TestLanguageService class for better testing. ([5a3d317](https://github.com/unit-mesh/auto-dev-vscode/commit/5a3d31714a9e4f18e96a890d7c515d03a8402252))
* **semantic-treesitter:** refactor JavaStructureParser to JavaStructurer and update tests and providers to use the new class [#2](https://github.com/unit-mesh/auto-dev-vscode/issues/2) ([853c061](https://github.com/unit-mesh/auto-dev-vscode/commit/853c061a772169092304e6547755b31d80bcd654))
* **semantic-treesitter:** refactor language service and add tests [#2](https://github.com/unit-mesh/auto-dev-vscode/issues/2) ([9c24bf4](https://github.com/unit-mesh/auto-dev-vscode/commit/9c24bf469e851cdc00f5978c51b95aed360814c2))
* **semantic-treesitter:** refactor structure provider and add support for precise code structure extraction using Tree-sitter [#2](https://github.com/unit-mesh/auto-dev-vscode/issues/2) ([d70c64a](https://github.com/unit-mesh/auto-dev-vscode/commit/d70c64aba319dbe29e2514296333f42a50823d2f))
* **semantic:** add .gitignore and counter.ts, refactor JavaStructure.test.ts [#2](https://github.com/unit-mesh/auto-dev-vscode/issues/2) ([501d4ff](https://github.com/unit-mesh/auto-dev-vscode/commit/501d4ff181de31b3419ac5c45300fb55d92c95af))
* **semantic:** add CommentUMLPresenter and refactor relatedProvider output handling. [#2](https://github.com/unit-mesh/auto-dev-vscode/issues/2) ([b0241a1](https://github.com/unit-mesh/auto-dev-vscode/commit/b0241a1301fc689a02909f80fb028fb2829152a7))
* **semantic:** add Java structure support and refactor TreeSitterLanguage.ts [#2](https://github.com/unit-mesh/auto-dev-vscode/issues/2) ([fd4457f](https://github.com/unit-mesh/auto-dev-vscode/commit/fd4457fd00e5f0dba9d6019b4e3ccc3c1c144873))
* **semantic:** add related provider manager [#2](https://github.com/unit-mesh/auto-dev-vscode/issues/2) ([c2bb842](https://github.com/unit-mesh/auto-dev-vscode/commit/c2bb842fd4b15754dfc4f35fc657aba920452ea3))
* **semantic:** add RelatedProvider and JavaRelatedProvider for code analysis ([625cd25](https://github.com/unit-mesh/auto-dev-vscode/commit/625cd25f08e96e4e2915b44a2422cfb9645dfefd)), closes [#2](https://github.com/unit-mesh/auto-dev-vscode/issues/2)
* **semantic:** add support for Java canonical name parsing and assignment in structures and tests [#2](https://github.com/unit-mesh/auto-dev-vscode/issues/2) ([60306d3](https://github.com/unit-mesh/auto-dev-vscode/commit/60306d3374c58a10517699376a9491f2f4919c6e))
* **semantic:** add support for loading language schemas from .scm files ([e0ba63d](https://github.com/unit-mesh/auto-dev-vscode/commit/e0ba63db6144f0223e63bdb95b2ecdf59ad4875f))
* **semantic:** add TestGenProvider interface and TestGenContext interface for test generation [#9](https://github.com/unit-mesh/auto-dev-vscode/issues/9) ([d0aab13](https://github.com/unit-mesh/auto-dev-vscode/commit/d0aab1341a159b60b0fc370e13b3381f8624ad2c))
* **semantic:** add TreeSitterFileUtil and TreeSitterFile for method ranges extraction [#9](https://github.com/unit-mesh/auto-dev-vscode/issues/9) ([bdc9764](https://github.com/unit-mesh/auto-dev-vscode/commit/bdc9764b9c0c7bffe300b3cb81ffb82a6f9fa0b3))
* **semantic:** add TypeScript language support and refactor Java structure detection logic [#9](https://github.com/unit-mesh/auto-dev-vscode/issues/9) ([ac3614f](https://github.com/unit-mesh/auto-dev-vscode/commit/ac3614f7fc0a66dacc452e2ab65944f759c1f819))
* **semantic:** improve method and class detection in Java and TypeScript files ([527548f](https://github.com/unit-mesh/auto-dev-vscode/commit/527548f80da47538c2c8e0e449479b0211c6b96d))
* **semantic:** introduce StructureParser class and refactor JavaStructure to use it [#2](https://github.com/unit-mesh/auto-dev-vscode/issues/2) ([44a8e22](https://github.com/unit-mesh/auto-dev-vscode/commit/44a8e22f3d0eb447885d9c8b3f2e13efe7fdbc4c))
* **semantic:** refactor and improve TreeSitter language configuration and structurer support [#2](https://github.com/unit-mesh/auto-dev-vscode/issues/2) ([68d6625](https://github.com/unit-mesh/auto-dev-vscode/commit/68d6625cab31670850af154baf872167398ad4c3))
* **semantic:** refactor and improve TreeSitter language configuration and structurer support [#2](https://github.com/unit-mesh/auto-dev-vscode/issues/2) ([07e784f](https://github.com/unit-mesh/auto-dev-vscode/commit/07e784f79637fd30dfe7f4138f5e14342453e1ed))
* **semantic:** refactor and improve TreeSitter language configuration and structurer support [#2](https://github.com/unit-mesh/auto-dev-vscode/issues/2) ([5ed7195](https://github.com/unit-mesh/auto-dev-vscode/commit/5ed7195ab672abe30f4ca6e84e20d13ef4b98560))
* **semantic:** refactor AutoDevCodeLensProvider to use TreeSitterFileUtil and TreeSitterFile for method ranges extraction, and add support for quick chat [#2](https://github.com/unit-mesh/auto-dev-vscode/issues/2) ([7bd9f4b](https://github.com/unit-mesh/auto-dev-vscode/commit/7bd9f4b62cf94c0146b06c3f36c62019a8892703))
* **semantic:** refactor AutoDevCodeLensProvider to use TreeSitterFileUtil and TreeSitterFile for method ranges extraction, and add support for quick chat [#2](https://github.com/unit-mesh/auto-dev-vscode/issues/2) ([730f583](https://github.com/unit-mesh/auto-dev-vscode/commit/730f583d6fcf9aaa6bd7daf0482110ccf03bd77b))
* **semantic:** refactor GoLangConfig.ts to use MemoizedQuery and add support for struct types in type_declaration. ([817c39c](https://github.com/unit-mesh/auto-dev-vscode/commit/817c39cf455c1bd95089b022738044b6d8d851d6))
* **semantic:** refactor GoLangConfig.ts to use MemoizedQuery and add support for struct types in type_declaration. ([9168834](https://github.com/unit-mesh/auto-dev-vscode/commit/9168834e4eac94e64773e7eddc27b799cbe30870))
* **semantic:** refactor related provider and code file cache manager [#2](https://github.com/unit-mesh/auto-dev-vscode/issues/2) ([bc73ac6](https://github.com/unit-mesh/auto-dev-vscode/commit/bc73ac67d3c4f1144e5cc8bdef030cbc84d1cb93))
* **semantic:** refactor RelatedProvider and JavaRelatedProvider to use CodeFile[] instead of string[] for fanIn and fanOut methods. [#2](https://github.com/unit-mesh/auto-dev-vscode/issues/2) ([715ca88](https://github.com/unit-mesh/auto-dev-vscode/commit/715ca881b43b196d4211acfda3063367759b9fa2))
* **semantic:** refactor RelatedProvider and JavaRelatedProvider to use CodeFile[] instead of string[] for fanIn and fanOut methods. [#2](https://github.com/unit-mesh/auto-dev-vscode/issues/2) ([b3e98a4](https://github.com/unit-mesh/auto-dev-vscode/commit/b3e98a4dd254cbc33303c7c1e9556312d71d219a))
* **semantic:** refactor RelatedProvider and JavaRelatedProvider to use CodeFile[] instead of string[] for fanIn and fanOut methods. [#2](https://github.com/unit-mesh/auto-dev-vscode/issues/2) ([8dd0c17](https://github.com/unit-mesh/auto-dev-vscode/commit/8dd0c17ba169b993b0bf09590068b7507aec6f7d))
* **semantic:** refactor RelatedProvider and JavaRelatedProvider to use CodeFile[] instead of string[] for fanIn and fanOut methods. [#2](https://github.com/unit-mesh/auto-dev-vscode/issues/2) ([4b6b50a](https://github.com/unit-mesh/auto-dev-vscode/commit/4b6b50a1f59a793e7cd0dc275c4e9fc1f8612280))
* **semantic:** refactor RelatedProvider and JavaRelatedProvider to use CodeFile[] instead of string[] for fanIn and fanOut methods. [#2](https://github.com/unit-mesh/auto-dev-vscode/issues/2) ([869f356](https://github.com/unit-mesh/auto-dev-vscode/commit/869f356f021591d786f72fc440725ea7e05fa26e))
* **settings:** refactor and add SettingService class [#9](https://github.com/unit-mesh/auto-dev-vscode/issues/9) ([02eee01](https://github.com/unit-mesh/auto-dev-vscode/commit/02eee014e2169ca75f8af5049b12e0ba54ceeb8b))
* setup VSCode test configuration and update dependencies [#2](https://github.com/unit-mesh/auto-dev-vscode/issues/2) ([1880b07](https://github.com/unit-mesh/auto-dev-vscode/commit/1880b0783d02b378aa30b9476b6d05a1f58f57b3))
* **spring-context:** add SpringContextProvider class to manage Spring framework dependencies and test frameworks. ([c4bcce8](https://github.com/unit-mesh/auto-dev-vscode/commit/c4bcce80380ab7b35e97e519243d57ca74a8d344))
* **spring-context:** refactor SpringLibrary and SpringContextProvider for better dependency detection and documentation generation. [#14](https://github.com/unit-mesh/auto-dev-vscode/issues/14) ([e53905c](https://github.com/unit-mesh/auto-dev-vscode/commit/e53905cd3b5dbf1b174aad7effdb9f0d5bbb76ae))
* swtich to vitejs ([711748d](https://github.com/unit-mesh/auto-dev-vscode/commit/711748d15588a85f378f0e1509e5af9a94e9cbfc))
* **team-prompts:** add TeamPromptExecTask class to manage team prompts interactions [#9](https://github.com/unit-mesh/auto-dev-vscode/issues/9) ([235971c](https://github.com/unit-mesh/auto-dev-vscode/commit/235971cd51d6733dec5396f347e37efdffba6f68))
* **team-prompts:** refactor and add rootPath to TeamPromptsBuilder.ts [#9](https://github.com/unit-mesh/auto-dev-vscode/issues/9) ([8256f05](https://github.com/unit-mesh/auto-dev-vscode/commit/8256f05ed2af858dffa8c67073906600c0e333f0))
* **template-rendering:** improve context handling in TemplateRender.ts ([11ddb1f](https://github.com/unit-mesh/auto-dev-vscode/commit/11ddb1f892b57847b011cdb767cb723ca1ef8df8))
* **template:** add Velocity-based template rendering system and related classes [#2](https://github.com/unit-mesh/auto-dev-vscode/issues/2) ([3f31bb1](https://github.com/unit-mesh/auto-dev-vscode/commit/3f31bb1fb899dd5160f3e7a292903ff9ad77e0d7))
* **test-gen:** refactor test generation logic to use chat context and LLM provider [#12](https://github.com/unit-mesh/auto-dev-vscode/issues/12) ([f2a4851](https://github.com/unit-mesh/auto-dev-vscode/commit/f2a4851a67f326bcf61d138b55476a7c6703f00e))
* **tooling:** refactor GradleTooling to use promises and add new GradleInfo class and related tests. [#9](https://github.com/unit-mesh/auto-dev-vscode/issues/9) ([e435063](https://github.com/unit-mesh/auto-dev-vscode/commit/e4350634407414530ebb26dcdb659c8cbbd2b6d4))
* **treesitter:** add package scripts [#2](https://github.com/unit-mesh/auto-dev-vscode/issues/2) ([3915e11](https://github.com/unit-mesh/auto-dev-vscode/commit/3915e114a9cd7a70404e8ceebfe7565bacdd415c))
* **treesitter:** make basic context works [#2](https://github.com/unit-mesh/auto-dev-vscode/issues/2) ([d71ef60](https://github.com/unit-mesh/auto-dev-vscode/commit/d71ef6080ec4870c2069413c8dedbb8028e1f3c5))
* **treesitter:** try for API [#2](https://github.com/unit-mesh/auto-dev-vscode/issues/2) ([891244f](https://github.com/unit-mesh/auto-dev-vscode/commit/891244fbef38e69a40ffd480f93d303080dcca9e))
* **typescript:** refactor method detection in TypeScript files [#9](https://github.com/unit-mesh/auto-dev-vscode/issues/9) ([4a474f3](https://github.com/unit-mesh/auto-dev-vscode/commit/4a474f33b94d9b3e4b5a888382b9d2b2e47e7213))
* **ui:** refactor status notification and add status bar management ([f34a289](https://github.com/unit-mesh/auto-dev-vscode/commit/f34a2891c794a0f468a11fe170db9b0d4e796aa3))
* **ui:** update quick chat icon and status bar item icon ([0de6939](https://github.com/unit-mesh/auto-dev-vscode/commit/0de693955f300c482284b5b54ec0dc7e132193b4))
* update design for protocol design ([cd9ee0a](https://github.com/unit-mesh/auto-dev-vscode/commit/cd9ee0a447d4ae0299d7a98fd431516cda497edb))
* **vscode-action:** add GitAction class for improved repository interaction [#9](https://github.com/unit-mesh/auto-dev-vscode/issues/9) ([9f6bbcf](https://github.com/unit-mesh/auto-dev-vscode/commit/9f6bbcf3b899ac93d28d9ba04816edd767371f71))
* **vscode-action:** refactor and add new methods for improved terminal interaction and file system handling [#9](https://github.com/unit-mesh/auto-dev-vscode/issues/9) ([6502944](https://github.com/unit-mesh/auto-dev-vscode/commit/650294422f674877a4012bbbd79f868097ba03bc))
* 去除测试文件 ([8d7f23f](https://github.com/unit-mesh/auto-dev-vscode/commit/8d7f23f045a70ab6ae42fdaac013826527e26b26))


### Reverts

* **semantic:** revert for comment ([f0d5325](https://github.com/unit-mesh/auto-dev-vscode/commit/f0d53252015968f2f835d74c7a43adf5baa4dd66))




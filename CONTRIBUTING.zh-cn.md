# 贡献指南

在提交 issue 或者 MR 之前，请先花几分钟时间阅读以下文字。

> [!IMPORTANT]
> 你必须提前阅读 [插件 API](https://code.visualstudio.com/api) 和 [调试](https://code.visualstudio.com/docs/editor/debugging) 文档，学习并理解如何开发一个 vscode 插件。

## 参与开发

要运行扩展，请按照以下步骤操作。

1. 确保你的开发环境中安装了 [`Node.js >= 20`](https://nodejs.org/zh-cn/) 和 [Visual Studio Code Insiders](https://code.visualstudio.com/insiders/)。

2. 按照下面的步骤操作，即可在启动拓展：

   ```sh
   # 克隆仓库
   $ git clone git@github.com:unit-mesh/auto-dev-vscode.git

   # 打开编辑器
   # 使用 code-insiders 而不是 code 命令
   $ code-insiders auto-dev-vscode
   ```

3. 安装拓展依赖

   ```sh
   # 因 vsce 原因，插件依赖请使用 npm 进行安装
   $ npm install
   ```

4. 安装 GUI 依赖

   如有功能性或其他问题，请提交到 [continuedev/continue](https://github.com/continuedev/continue/tree/main/gui)。

   ```sh
   $ cd gui-sidebar

   $ npm install && npm run watch
   ```

5. 现在，你可以使用编辑器的 [Run and Debug](https://code.visualstudio.com/docs/editor/debugging) 启动插件了。

## 运行测试

可以使用以下命令：

```sh
$ npm test
```

提交前，请检查语法和打包是否正常：

```sh
$ npm run lint

$ npm run pa
```

## 同步最新代码

```sh
# 添加主仓库到 remote，作为 fork 后仓库的上游仓库
$ git remote add upstream git@github.com:unit-mesh/auto-dev-vscode.git

# 拉取主仓库最新代码
$ git fetch upstream

# 切换至 master 分支
$ git checkout master

# 合并主仓库代码
$ git merge upstream/master
```

## 提交规范

在提交 Merge Request 时，请注意：

- 如果遇到问题，建议保持你的 MR 足够小。保证一个 MR 只解决单个问题、添加单个功能。
- 在 MR 中请添加合适的描述，并关联相关的 Issue。

## 合并流程

- fork 主仓库，如果已经 fork 过，请同步主仓库的最新代码。
- 基于 fork 后仓库的主分支，并新建一个分支，如：feat-xxxx
- 在新分支上进行开发，开发完成后，提 Merge Request 到主仓库的 master 分支。
- Merge Request 会在 Review 通过后被合并到主仓库。

## 沟通与交流

- 遇到问题时，请先确认这个问题是否已经在 issue 中有记录或者已被修复。
- 提 issue 时，请用简短的语言描述遇到的问题，并添加出现问题时的环境和复现步骤。
- 其他交流，请一律发布到 discussions。

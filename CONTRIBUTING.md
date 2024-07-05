# Contributing

Please begin by reading [Extension API](https://code.visualstudio.com/api) and [Debugger](https://code.visualstudio.com/docs/editor/debugging). The the official vscode document will provide you with all the information you need to get started.

## Getting started

To run extension, follow these steps.

1. Ensure that [`Node.js >= 20`](https://nodejs.org/zh-cn/) and [Visual Studio Code Insiders](https://code.visualstudio.com/insiders/) is installed. This provides the platform on which the build tooling runs.
2. Follow the steps below to start the extension in the：

    ```sh
    # Clone the repo
    $ git clone git@github.com:unit-mesh/auto-dev-vscode.git

    # Open in vscode-insiders
    $ code-insiders auto-dev-vscode
    ```

3. Installing Extension Dependencies

    ```sh
    # vsce currently only supports npm
		# see https://github.com/microsoft/vscode-vsce/issues/517
		# see https://github.com/microsoft/vscode-vsce/issues/421
    $ npm install
    ```

4. Now you can start it with [Run and Debug](https://code.visualstudio.com/docs/editor/debugging).

## Running The Tests

You can now run the tests with this command:

```sh
$ npm test
```

Better run lint and package:

```sh
$ npm run lint

$ npm run pa
```

## Staying Up-to-Date

```sh
$ git remote add upstream git@github.com:unit-mesh/auto-dev-vscode.git

$ git fetch upstream

$ git checkout master

$ git merge upstream/master
```

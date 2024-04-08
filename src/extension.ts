import * as vscode from "vscode";

import { install } from "./codelens";
import { registerCommands } from "./commands";

const channel = vscode.window.createOutputChannel("AUTO-DEV-VSCODE");
export function activate(context: vscode.ExtensionContext) {
  channel.show();
  console.log(
    'Congratulations, your extension "auto-dev-vscode" is now active!'
  );

  let disposable = vscode.commands.registerCommand(
    "auto-dev-vscode.helloWorld",
    () => {
      vscode.window.showInformationMessage("Hello World from auto-dev-vscode!");
    }
  );
  context.subscriptions.push(disposable);

  install(context);

  registerCommands(context);

  let sidebar = new AutoDevWebviewViewProvider();
  // Sidebar
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      "autodv.autodevGUIView",
      sidebar,
      {
        webviewOptions: { retainContextWhenHidden: true },
      }
    )
  );
}

export function deactivate() {}

export class AutoDevWebviewViewProvider implements vscode.WebviewViewProvider {
  private _webview?: vscode.Webview;

  get webview() {
    return this._webview;
  }

  public static readonly viewType = "autodev.autodevGUIView";
  resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext<unknown>,
    token: vscode.CancellationToken
  ): void | Thenable<void> {
    this._webview = webviewView.webview;
    webviewView.webview.html = this.getSidebarContent(webviewView);
  }

  getSidebarContent(webviewView: vscode.WebviewView): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hello, World!</title>
</head>
<body>
    <h1>Hello, World!</h1>
</body>
</html>
`;
  }
}

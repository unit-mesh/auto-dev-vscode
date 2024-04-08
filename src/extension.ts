import * as vscode from "vscode";

import { install } from "./codelens";
import { registerCommands } from "./commands";
import { registerQuickFixProvider } from "./providers/registerProviders";
import { AutoDevWebviewViewProvider } from "./webview/AutoDevWebviewViewProvider";
import { IdeImpl } from "./action/ide-impl";

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


  // Register commands and providers
  registerQuickFixProvider();

  const sidebar = new AutoDevWebviewViewProvider();
  const action = new IdeImpl();
  registerCommands(context, sidebar, action);

  // Sidebar
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      "autodev.autodevGUIView",
      sidebar,
      {
        webviewOptions: { retainContextWhenHidden: true },
      }
    )
  );
}

export function deactivate() {}



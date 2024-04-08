import * as vscode from "vscode";

import { install } from "./codelens";
import { registerCommands } from "./commands";
import { AutoDevWebviewViewProvider } from "./webview/AutoDevWebviewViewProvider";
import { IdeImpl } from "./action/ide-impl";

const channel = vscode.window.createOutputChannel("AUTO-DEV-VSCODE");
export function activate(context: vscode.ExtensionContext) {
  channel.show();
  install(context);

  //   registerActionProvider(context);

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

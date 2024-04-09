import * as vscode from "vscode";

import { install } from "./codelens";
import { registerCommands } from "./commands";
import { AutoDevWebviewViewProvider } from "./webview/AutoDevWebviewViewProvider";
import { IdeImpl } from "./action/ide-impl";

const channel = vscode.window.createOutputChannel("AUTO-DEV-VSCODE");
export function activate(context: vscode.ExtensionContext) {
  channel.show();
  install(context);

  const sidebar = new AutoDevWebviewViewProvider();
  const action = new IdeImpl();

  registerCommands(context, sidebar, action);

  vscode.window.onDidChangeActiveTextEditor(
    (editor: vscode.TextEditor | undefined) => {
      if (!editor) {
        return;
      }

      const uri = editor.document.uri;
      //   registerActionProvider(context);
      // doc management
      // use tree sitter to parse ast and method to results and also cache for file by document
      // 1. autotest
      // 2. autodoc
      // 3. chatwithcode
    }
  );

  // Sidebar commands
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

import * as vscode from "vscode";

import { registerCodeLens } from "./codelens";
import { registerCommands } from "./commands";
import { AutoDevWebviewViewProvider } from "./webview/AutoDevWebviewViewProvider";
import { IdeImpl } from "./action/ide-impl";
import { DocumentManager } from "./document/DocumentManager";
import { DiffManager } from "./diff/DiffManager";
import { AutoDevContext } from "./autodev-context";
import { TreeSitterFile, TreeSitterFileError } from "./semantic-treesitter/TreeSitterFile";
import { IdentifierBlockRange } from "./document/IdentifierBlockRange";
import { commands } from "vscode";
import { CodeActionParams } from "vscode-languageclient";
import { registerQuickFixProvider } from "./providers/registerProviders";
import { registerAutoDevProviders } from "./providers/registerAutoDevProviders";

const channel = vscode.window.createOutputChannel("AUTO-DEV-VSCODE");

export function activate(context: vscode.ExtensionContext) {
  channel.show();

  const sidebar = new AutoDevWebviewViewProvider();
  const action = new IdeImpl();
  const documentManager = new DocumentManager();
  const diffManager = new DiffManager();
  const autoDevContext = new AutoDevContext(sidebar, action, documentManager, diffManager, context);

  registerCodeLens(autoDevContext);
  registerCommands(autoDevContext);
  registerAutoDevProviders(autoDevContext);
  registerQuickFixProvider(autoDevContext);

  vscode.window.onDidChangeActiveTextEditor(
    async (editor: vscode.TextEditor | undefined) => {
      if (!editor) {
        return;
      }

      // todo: add cache
    }
  );

  // Sidebar commands
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      "autodev.autodevGUIView",
      sidebar,
      { webviewOptions: { retainContextWhenHidden: true }, }
    )
  );
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
// @ts-ignore
export function deactivate() {}

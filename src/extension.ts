import * as vscode from "vscode";

import { registerCodeLens } from "./codelens";
import { registerCommands } from "./commands";
import { AutoDevWebviewViewProvider } from "./webview/AutoDevWebviewViewProvider";
import { IdeImpl } from "./action/ide-impl";
import { RecentlyDocumentManager } from "./document/RecentlyDocumentManager";
import { DiffManager } from "./diff/DiffManager";
import { AutoDevContext } from "./autodev-context";
import { registerQuickFixProvider } from "./providers/registerQuickFixProvider";
import { registerAutoDevProviders } from "./providers/registerAutoDevProviders";

const channel = vscode.window.createOutputChannel("AutoDev");

export function activate(context: vscode.ExtensionContext) {
  channel.show();

  const sidebar = new AutoDevWebviewViewProvider(context);
  const action = new IdeImpl();
  const documentManager = new RecentlyDocumentManager();
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

      documentManager.updateCurrentDocument(editor.document);
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

import * as vscode from "vscode";

import { registerCodeLens } from "./codelens";
import { registerCommands } from "./commands";
import { AutoDevWebviewViewProvider } from "./webview/AutoDevWebviewViewProvider";
import { IdeImpl } from "./action/ide-impl";
import { RecentlyDocumentManager } from "./document/RecentlyDocumentManager";
import { DiffManager } from "./diff/DiffManager";
import { AutoDevExtension } from "./auto-dev-extension";
import { registerQuickFixProvider } from "./providers/registerQuickFixProvider";
import { registerAutoDevProviders } from "./providers/registerAutoDevProviders";
import { StructureProvider } from "./semantic-treesitter/StructureProvider";
import Parser from "web-tree-sitter";

import { setExtensionContext, removeExtensionContext } from './context';

const channel = vscode.window.createOutputChannel("AutoDev");

export function activate(context: vscode.ExtensionContext) {
  setExtensionContext(context);

  channel.show();

  const sidebar = new AutoDevWebviewViewProvider(context);
  const action = new IdeImpl();
  const documentManager = new RecentlyDocumentManager();
  const diffManager = new DiffManager();
  let structureProvider = new StructureProvider();
  const extension = new AutoDevExtension(sidebar, action, documentManager, diffManager, context);
  Parser.init().then(async () => {
      await structureProvider.init();
      extension.setStructureProvider(structureProvider);
    }
  );

  registerCodeLens(extension);
  registerCommands(extension);
  registerAutoDevProviders(extension);
  registerQuickFixProvider(extension);

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
export function deactivate() {
  removeExtensionContext();
}

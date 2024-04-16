import * as vscode from "vscode";

import { registerCommands } from "./commands";
import { AutoDevWebviewViewProvider } from "./editor/webview/AutoDevWebviewViewProvider";
import { VSCodeAction } from "./editor/action/VSCodeAction";
import { RecentlyDocumentManager } from "./editor/document/RecentlyDocumentManager";
import { DiffManager } from "./editor/diff/DiffManager";
import { AutoDevExtension } from "./AutoDevExtension";
import { StructurerProviderManager } from "./codecontext/StructurerProviderManager";
const Parser = require("web-tree-sitter");

import { removeExtensionContext, setExtensionContext } from './context';
import {
  registerAutoDevProviders,
  registerCodeLensProviders,
  registerQuickFixProvider, registerWebViewProvider
} from "./editor/providers/ProviderRegister";
import { channel } from "./channel";
import { RelatedCodeProviderManager } from "./codecontext/RelatedCodeProviderManager";
import { CodeFileCacheManager } from "./editor/cache/CodeFileCacheManager";
import { StatusNotification } from "./editor/action/StatusNotification";
import { ToolingDetector } from "./chatcontext/tooling/ToolingDetector";

export async function activate(context: vscode.ExtensionContext) {
  setExtensionContext(context);

  channel.show();

  const sidebar = new AutoDevWebviewViewProvider(context);
  const action = new VSCodeAction();
  let structureProvider = new StructurerProviderManager();

  const documentManager = new RecentlyDocumentManager();
  const diffManager = new DiffManager();
  const fileCacheManager = new CodeFileCacheManager(structureProvider);
  const relatedManager = new RelatedCodeProviderManager(fileCacheManager);
  const extension = new AutoDevExtension(
    sidebar, action, documentManager, diffManager, relatedManager, fileCacheManager, context,
  );
  // new ToolingDetector().execute().then((deps) => {
  // });

  Parser.init().then(async () => {
      await structureProvider.init();
      extension.setStructureProvider(structureProvider);
    }
  );

  // TODO: split different type commands
  registerCommands(extension);

  registerCodeLensProviders(extension);
  registerAutoDevProviders(extension);
  registerQuickFixProvider(extension);
  registerWebViewProvider(extension);

  vscode.window.onDidChangeActiveTextEditor(
    async (editor: vscode.TextEditor | undefined) => {
      if (!editor) {
        return;
      }

      documentManager.updateCurrentDocument(editor.document);
    }
  );

  // on closed editor

  // create a new status bar item that we can now manage
  StatusNotification.instance.create();
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
// @ts-ignore
export function deactivate() {
  removeExtensionContext();
}

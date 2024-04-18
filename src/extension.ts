import * as vscode from "vscode";

import { registerCommands } from "./commands";
import { AutoDevWebviewViewProvider } from "./editor/webview/AutoDevWebviewViewProvider";
import { VSCodeAction } from "./editor/editor-api/VSCodeAction";
import { RecentlyDocumentManager } from "./editor/document/RecentlyDocumentManager";
import { DiffManager } from "./editor/diff/DiffManager";
import { AutoDevExtension } from "./AutoDevExtension";
import { StructurerProviderManager } from "./code-context/StructurerProviderManager";
import Parser from "web-tree-sitter";

import { removeExtensionContext, setExtensionContext } from './context';
import {
  registerAutoDevProviders,
  registerCodeLensProviders,
  registerQuickFixProvider,
  registerWebViewProvider
} from "./editor/providers/ProviderRegister";
import { channel } from "./channel";
import { RelatedCodeProviderManager } from "./code-context/RelatedCodeProviderManager";
import { CodeFileCacheManager } from "./editor/cache/CodeFileCacheManager";
import { StatusNotification } from "./editor/editor-api/StatusNotification";

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
  //

  Parser.init().then(async () => {
      registerCodeLensProviders(extension);
      registerAutoDevProviders(extension);
      registerQuickFixProvider(extension);

      await structureProvider.init();
      extension.setStructureProvider(structureProvider);
    }
  );


  // TODO: split different type commands
  registerCommands(extension);
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

export function deactivate() {
  removeExtensionContext();
}

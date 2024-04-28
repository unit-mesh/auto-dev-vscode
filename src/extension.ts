import * as vscode from "vscode";
// FOR Dependency Injection with Inversify
import "reflect-metadata";

import { registerCommands } from "./commands";
import { AutoDevWebviewViewProvider } from "./editor/webview/AutoDevWebviewViewProvider";
import { VSCodeAction } from "./editor/editor-api/VSCodeAction";
import { RecentlyDocumentManager } from "./editor/document/RecentlyDocumentManager";
import { DiffManager } from "./editor/diff/DiffManager";
import { AutoDevExtension } from "./AutoDevExtension";
import Parser from "web-tree-sitter";

import { removeExtensionContext, setExtensionContext } from './context';
import {
	registerAutoDevProviders,
	registerCodeLensProviders,
	registerQuickFixProvider,
	registerWebViewProvider
} from "./editor/providers/ProviderUtils";
import { channel } from "./channel";
import { RelatedCodeProviderManager } from "./code-context/RelatedCodeProviderManager";
import { CodeFileCacheManager } from "./editor/cache/CodeFileCacheManager";
import { AutoDevStatusManager } from "./editor/editor-api/AutoDevStatusManager";
import { BuildToolSync } from "./toolchain-context/buildtool/BuildToolSync";
import { CodebaseIndexer } from "./code-search/CodebaseIndexer";

export async function activate(context: vscode.ExtensionContext) {
	setExtensionContext(context);
	const sidebar = new AutoDevWebviewViewProvider(context);
	const action = new VSCodeAction();

	const documentManager = new RecentlyDocumentManager();
	const diffManager = new DiffManager();
	const fileCacheManager = new CodeFileCacheManager();
	const relatedManager = new RelatedCodeProviderManager(fileCacheManager);
	const extension = new AutoDevExtension(
		sidebar, action, documentManager, diffManager, relatedManager, fileCacheManager, context,
	);

	Parser.init().then(async () => {
			registerCodeLensProviders(extension);
			registerAutoDevProviders(extension);
			registerQuickFixProvider(extension);

			await new BuildToolSync().startWatch();
		}
	);

	registerCommands(extension);
	registerWebViewProvider(extension);
	bindingDocumentChange(documentManager);

	AutoDevStatusManager.instance.create();

	// setup for index
	channel.show();
}

function bindingDocumentChange(documentManager: RecentlyDocumentManager) {
	vscode.window.onDidChangeActiveTextEditor(
		async (editor: vscode.TextEditor | undefined) => {
			if (!editor) {
				return;
			}

			documentManager.updateCurrentDocument(editor.document);
		}
	);

	vscode.workspace.onDidCloseTextDocument(async (document: vscode.TextDocument) => {
	});
}

export function deactivate() {
	removeExtensionContext();
}

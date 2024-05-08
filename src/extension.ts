import * as vscode from "vscode";
// for Dependency Injection with InversifyJS
import "reflect-metadata";
import Parser from "web-tree-sitter";

import { registerCommands } from "./commands/commands";
import { AutoDevWebviewViewProvider } from "./editor/webview/AutoDevWebviewViewProvider";
import { VSCodeAction } from "./editor/editor-api/VSCodeAction";
import { RecentlyDocumentManager } from "./editor/document/RecentlyDocumentManager";
import { DiffManager } from "./editor/diff/DiffManager";
import { AutoDevExtension } from "./AutoDevExtension";
import { removeExtensionContext, setExtensionContext } from './context';
import {
	registerAutoDevProviders,
	registerCodeLensProviders,
	registerQuickFixProvider,
	registerRenameAction,
	registerWebViewProvider
} from "./editor/providers/ProviderUtils";
import { channel } from "./channel";
import { RelevantCodeProviderManager } from "./code-context/RelevantCodeProviderManager";
import { CodeFileCacheManager } from "./editor/cache/CodeFileCacheManager";
import { AutoDevStatusManager } from "./editor/editor-api/AutoDevStatusManager";
import { BuildToolObserver } from "./toolchain-context/buildtool/BuildToolObserver";
import { CodebaseIndexer } from "./code-search/CodebaseIndexer";
import { TreeSitterFileManager } from "./editor/cache/TreeSitterFileManager";

(globalThis as any).self = globalThis;

export async function activate(context: vscode.ExtensionContext) {
	setExtensionContext(context);
	const sidebar = new AutoDevWebviewViewProvider(context);
	const action = new VSCodeAction();

	const documentManager = new RecentlyDocumentManager();
	const diffManager = new DiffManager();
	const fileCacheManager = new CodeFileCacheManager();
	const relatedManager = new RelevantCodeProviderManager();

	const extension = new AutoDevExtension(
		sidebar, action, documentManager, diffManager, relatedManager, fileCacheManager, context,
	);

	Parser.init().then(async () => {
			registerCodeLensProviders(extension);
			registerAutoDevProviders(extension);
			registerQuickFixProvider(extension);
			registerCommands(extension);

			registerRenameAction(extension);

			TreeSitterFileManager.getInstance();

			await new BuildToolObserver().startWatch();
		}
	);

	registerWebViewProvider(extension);
	documentManager.bindChanges();

	AutoDevStatusManager.instance.create();

	channel.show();

	// setup for index
	let codebaseIndexer = new CodebaseIndexer();
	codebaseIndexer.init();
}

export function deactivate() {
	removeExtensionContext();
}

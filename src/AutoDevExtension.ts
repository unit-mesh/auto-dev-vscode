import * as vscode from "vscode";

import { AutoDevWebviewViewProvider } from "./editor/webview/AutoDevWebviewViewProvider";
import { VSCodeAction } from "./editor/editor-api/VSCodeAction";
import { RecentlyDocumentManager } from "./editor/document/RecentlyDocumentManager";
import { DiffManager } from "./editor/diff/DiffManager";
import { StructurerProviderManager } from "./code-context/StructurerProviderManager";
import { CodeFileCacheManager } from "./editor/cache/CodeFileCacheManager";
import { CodebaseIndexer } from "./code-search/CodebaseIndexer";
import { AutoDevWebviewProtocol } from "./editor/webview/AutoDevWebviewProtocol";

export class AutoDevExtension {
	// the WebView for interacting with the editor
	sidebar: AutoDevWebviewViewProvider;
	action: VSCodeAction;
	diffManager: DiffManager;
	documentManager: RecentlyDocumentManager;
	extensionContext: vscode.ExtensionContext;
	structureProvider: StructurerProviderManager | undefined;
	indexer: CodebaseIndexer;
	private webviewProtocol: AutoDevWebviewProtocol;

	constructor(
		sidebar: AutoDevWebviewViewProvider,
		action: VSCodeAction,
		documentManager: RecentlyDocumentManager,
		diffManager: DiffManager,
		context: vscode.ExtensionContext) {
		this.sidebar = sidebar;
		this.action = action;
		this.diffManager = diffManager;
		this.documentManager = documentManager;
		this.extensionContext = context;

		this.indexer = new CodebaseIndexer();
		this.webviewProtocol = this.sidebar.webviewProtocol;

		vscode.workspace.workspaceFolders?.map((folder) => folder.uri.fsPath).forEach(async (dir) => {
			this.refreshCodebaseIndex([dir]);
		});
	}

	private indexingCancellationController: AbortController | undefined;

	private async refreshCodebaseIndex(dirs: string[]) {
		if (this.indexingCancellationController) {
			this.indexingCancellationController.abort();
		}

		const that = this;

		this.indexingCancellationController = new AbortController();
		for await (const update of this.indexer.refresh(dirs, this.indexingCancellationController.signal)) {
			that.webviewProtocol?.request("indexProgress", update);
		}
	}
}

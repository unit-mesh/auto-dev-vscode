import * as vscode from "vscode";

import { AutoDevWebviewViewProvider } from "./editor/webview/AutoDevWebviewViewProvider";
import { VSCodeAction } from "./editor/editor-api/VSCodeAction";
import { RecentlyDocumentManager } from "./editor/document/RecentlyDocumentManager";
import { DiffManager } from "./editor/diff/DiffManager";
import { StructurerProviderManager } from "./code-context/StructurerProviderManager";
import { CodebaseIndexer } from "./code-search/CodebaseIndexer";
import { AutoDevWebviewProtocol } from "./editor/webview/AutoDevWebviewProtocol";
import { LocalEmbeddingProvider } from "./code-search/embedding/LocalEmbeddingProvider";

export class AutoDevExtension {
	// the WebView for interacting with the editor
	sidebar: AutoDevWebviewViewProvider;
	ideAction: VSCodeAction;
	diffManager: DiffManager;
	documentManager: RecentlyDocumentManager;
	extensionContext: vscode.ExtensionContext;
	structureProvider: StructurerProviderManager | undefined;
	indexer: CodebaseIndexer | undefined;
	private webviewProtocol: AutoDevWebviewProtocol;

	constructor(
		sidebar: AutoDevWebviewViewProvider,
		action: VSCodeAction,
		documentManager: RecentlyDocumentManager,
		diffManager: DiffManager,
		context: vscode.ExtensionContext) {
		this.sidebar = sidebar;
		this.ideAction = action;
		this.diffManager = diffManager;
		this.documentManager = documentManager;
		this.extensionContext = context;

		this.webviewProtocol = this.sidebar.webviewProtocol;

		// waiting for index command
		vscode.workspace.workspaceFolders?.map((folder) => folder.uri.fsPath).forEach(async (dir) => {
			let localInference = new LocalEmbeddingProvider();
			localInference.init().then(() => {
				this.indexer = new CodebaseIndexer(localInference, this.ideAction);
				this.refreshCodebaseIndex([dir]);
			});
		});
	}

	private indexingCancellationController: AbortController | undefined;

	private async refreshCodebaseIndex(dirs: string[]) {
		if (this.indexingCancellationController) {
			this.indexingCancellationController.abort();
		}

		const that = this;

		this.indexingCancellationController = new AbortController();
		for await (const update of this.indexer!!.refresh(dirs, this.indexingCancellationController.signal)) {
			that.webviewProtocol?.request("indexProgress", update);
		}
	}
}

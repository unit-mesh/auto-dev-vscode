import * as vscode from "vscode";

import { AutoDevWebviewViewProvider } from "./editor/webview/AutoDevWebviewViewProvider";
import { VSCodeAction } from "./editor/editor-api/VSCodeAction";
import { RecentlyDocumentManager } from "./editor/document/RecentlyDocumentManager";
import { DiffManager } from "./editor/diff/DiffManager";
import { StructurerProviderManager } from "./code-context/StructurerProviderManager";
import { CodebaseIndexer } from "./code-search/CodebaseIndexer";
import { AutoDevWebviewProtocol } from "./editor/webview/AutoDevWebviewProtocol";
import { LocalEmbeddingProvider } from "./code-search/embedding/LocalEmbeddingProvider";
import { SqliteDb } from "./code-search/database/SqliteDb";
import { getExtensionUri } from "./context";
import { channel } from "./channel";
import { EmbeddingsProvider } from "./code-search/embedding/_base/EmbeddingsProvider";

export class AutoDevExtension {
	// the WebView for interacting with the editor
	sidebar: AutoDevWebviewViewProvider;
	ideAction: VSCodeAction;
	diffManager: DiffManager;
	documentManager: RecentlyDocumentManager;
	extensionContext: vscode.ExtensionContext;
	structureProvider: StructurerProviderManager | undefined;
	private webviewProtocol: AutoDevWebviewProtocol;
	embeddingsProvider: EmbeddingsProvider | undefined;

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
	}

	/**
	 * The `indexing` method is an asynchronous function that initializes the indexing process of directories in the workspace.
	 *
	 * This method first attempts to get an instance of the SQLite database using the `SqliteDb.get()` method. If an error occurs during this process, it is caught and logged to the console.
	 *
	 * The method then retrieves the directories in the workspace using `vscode.workspace.workspaceFolders?.map((folder) => folder.uri.fsPath)`. If directories are found, it logs the start of the indexing process and the directories to be indexed.
	 *
	 * A new instance of `LocalEmbeddingProvider` is created and initialized with the file system path of the extension URI. This instance is then set as the `embeddingsProvider`.
	 *
	 * Once the `LocalEmbeddingProvider` is initialized, a new `CodebaseIndexer` instance is created with the `LocalEmbeddingProvider` and `ideAction` as parameters. The `refreshCodebaseIndex` method is then called with the `CodebaseIndexer` and directories as parameters.
	 *
	 * This method does not return any value.
	 *
	 * @throws {Error} If an error occurs while getting the SQLite database instance.
	 * @async
	 */
	public async indexing() {
		try {
			let sqliteDb = await SqliteDb.get();
		} catch (e) {
			console.log(e);
		}

		// waiting for index command
		let dirs = vscode.workspace.workspaceFolders?.map((folder) => folder.uri.fsPath);
		if (dirs) {
			channel.appendLine("start indexing dirs:" + dirs);
			let localInference = new LocalEmbeddingProvider();
			let fsPath = getExtensionUri().fsPath;
			this.embeddingsProvider = localInference;
			localInference.init(fsPath).then(() => {
				const indexer = new CodebaseIndexer(localInference, this.ideAction);
				this.refreshCodebaseIndex(indexer, dirs).then(r => {
				});
			});
		}
	}

	private indexingCancellationController: AbortController | undefined;

	private async refreshCodebaseIndex(indexer: CodebaseIndexer, dirs: string[]) {
		if (this.indexingCancellationController) {
			this.indexingCancellationController.abort();
		}

		const that = this;

		this.indexingCancellationController = new AbortController();
		for await (const update of indexer.refresh(dirs, this.indexingCancellationController.signal)) {
			channel.appendLine("indexing progress: " + update.progress + " - " + update.desc);
			that.webviewProtocol?.request("indexProgress", update);
		}
	}
}

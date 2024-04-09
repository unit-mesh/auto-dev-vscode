import * as vscode from "vscode";

import { AutoDevWebviewViewProvider } from "./webview/AutoDevWebviewViewProvider";
import { IdeImpl } from "./action/ide-impl";
import { RecentlyDocumentManager } from "./document/RecentlyDocumentManager";
import { DiffManager } from "./diff/DiffManager";

export class AutoDevContext {
	sidebar: AutoDevWebviewViewProvider;
	action: IdeImpl;
	diffManager: DiffManager;
	documentManager: RecentlyDocumentManager;
	vscContext: vscode.ExtensionContext;

	constructor(
		sidebar: AutoDevWebviewViewProvider,
		action: IdeImpl,
		documentManager: RecentlyDocumentManager,
		diffManager: DiffManager,
		context: vscode.ExtensionContext) {
		this.sidebar = sidebar;
		this.action = action;
		this.diffManager = diffManager;
		this.documentManager = documentManager;
		this.vscContext = context;
	}
}

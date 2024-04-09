import * as vscode from "vscode";

import { AutoDevWebviewViewProvider } from "./webview/AutoDevWebviewViewProvider";
import { IdeImpl } from "./action/ide-impl";
import { DocumentManager } from "./document/DocumentManager";
import { DiffManager } from "./diff/DiffManager";

export class AutoDevContext {
	sidebar: AutoDevWebviewViewProvider;
	action: IdeImpl;
	diffManager: DiffManager;
	documentManager: DocumentManager;
	vscContext: vscode.ExtensionContext;

	constructor(
		sidebar: AutoDevWebviewViewProvider,
		action: IdeImpl,
		documentManager: DocumentManager,
		diffManager: DiffManager,
		context: vscode.ExtensionContext) {
		this.sidebar = sidebar;
		this.action = action;
		this.diffManager = diffManager;
		this.documentManager = documentManager;
		this.vscContext = context;
	}

}

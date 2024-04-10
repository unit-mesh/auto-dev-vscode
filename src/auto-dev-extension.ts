import * as vscode from "vscode";

import { AutoDevWebviewViewProvider } from "./webview/AutoDevWebviewViewProvider";
import { IdeImpl } from "./action/ide-impl";
import { RecentlyDocumentManager } from "./document/RecentlyDocumentManager";
import { DiffManager } from "./diff/DiffManager";
import { StructureProvider } from "./semantic-treesitter/StructureProvider";

export class AutoDevExtension {
	sidebar: AutoDevWebviewViewProvider;
	action: IdeImpl;
	diffManager: DiffManager;
	documentManager: RecentlyDocumentManager;
	extensionContext: vscode.ExtensionContext;
	structureProvider: StructureProvider | undefined;

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
		this.extensionContext = context;
	}

	setStructureProvider(structureProvider: StructureProvider) {
		this.structureProvider = structureProvider;
	}

	getStructureProvider(): StructureProvider | undefined {
		return this.structureProvider;
	}
}

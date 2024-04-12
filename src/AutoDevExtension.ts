import * as vscode from "vscode";

import { AutoDevWebviewViewProvider } from "./webview/AutoDevWebviewViewProvider";
import { VSCodeAction } from "./action/VSCodeAction";
import { RecentlyDocumentManager } from "./document/RecentlyDocumentManager";
import { DiffManager } from "./diff/DiffManager";
import { StructurerProviderManager } from "./semantic-treesitter/structurer/StructurerProviderManager";

export class AutoDevExtension {
	sidebar: AutoDevWebviewViewProvider;
	action: VSCodeAction;
	diffManager: DiffManager;
	documentManager: RecentlyDocumentManager;
	extensionContext: vscode.ExtensionContext;
	structureProvider: StructurerProviderManager | undefined;

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
	}

	setStructureProvider(structureProvider: StructurerProviderManager) {
		this.structureProvider = structureProvider;
	}

	getStructureProvider(): StructurerProviderManager | undefined {
		return this.structureProvider;
	}
}

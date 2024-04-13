import * as vscode from "vscode";

import { AutoDevWebviewViewProvider } from "./webview/AutoDevWebviewViewProvider";
import { VSCodeAction } from "./action/VSCodeAction";
import { RecentlyDocumentManager } from "./document/RecentlyDocumentManager";
import { DiffManager } from "./diff/DiffManager";
import { StructurerProviderManager } from "./semantic/StructurerProviderManager";
import { RelatedProviderManager } from "./semantic/RelatedProviderManager";
import { CodeFileCacheManager } from "./cache/CodeFileCacheManager";

export class AutoDevExtension {
	sidebar: AutoDevWebviewViewProvider;
	action: VSCodeAction;
	diffManager: DiffManager;
	documentManager: RecentlyDocumentManager;
	extensionContext: vscode.ExtensionContext;
	structureProvider: StructurerProviderManager | undefined;
	relatedManager: RelatedProviderManager;
	fileCacheManager: CodeFileCacheManager;

	constructor(
		sidebar: AutoDevWebviewViewProvider,
		action: VSCodeAction,
		documentManager: RecentlyDocumentManager,
		diffManager: DiffManager,
		relatedManager: RelatedProviderManager,
		fileCacheManager: CodeFileCacheManager,
		context: vscode.ExtensionContext) {
		this.sidebar = sidebar;
		this.action = action;
		this.diffManager = diffManager;
		this.documentManager = documentManager;
		this.relatedManager = relatedManager;
		this.fileCacheManager = fileCacheManager;
		this.extensionContext = context;
	}

	setStructureProvider(structureProvider: StructurerProviderManager) {
		this.structureProvider = structureProvider;
	}
}

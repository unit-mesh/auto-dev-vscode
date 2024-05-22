import * as vscode from "vscode";
import { l10n } from "vscode";

import { SUPPORTED_LANGUAGES, SupportedLanguage } from "../../editor/language/SupportedLanguage";
import { AutoDevExtension } from "../../AutoDevExtension";
import { TreeSitterFile, TreeSitterFileError } from "../../code-context/ast/TreeSitterFile";
import { NamedElement } from "../../editor/ast/NamedElement";
import { NamedElementBuilder } from "../../editor/ast/NamedElementBuilder";
import { TreeSitterFileManager } from "../../editor/cache/TreeSitterFileManager";
import { DefaultLanguageService } from "../../editor/language/service/DefaultLanguageService";

export class AutoDevCodeLensProvider implements vscode.CodeLensProvider {
	private _eventEmitter: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
	onDidChangeCodeLenses: vscode.Event<void> = this._eventEmitter.event;

	constructor(private readonly context: AutoDevExtension) {
		vscode.workspace.onDidChangeTextDocument(async (event) => {
			this.refresh();
		});
	}

	provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.ProviderResult<vscode.CodeLens[]> {
		return (async () => {
			const languageId = document.languageId as SupportedLanguage;
			if (!SUPPORTED_LANGUAGES.includes(languageId)) {
				return [];
			}

			let tsfile: TreeSitterFile;
			/// todo: for a simple file, we can just don't use cache, since we update algorithm is not correct
			if (document.lineCount > 256) {
				const src = document.getText();
				const langId = document.languageId;
				tsfile = await TreeSitterFile.create(src, langId, new DefaultLanguageService(), document.uri.fsPath);
			} else {
				tsfile = await TreeSitterFileManager.create(document);
			}

			return this.buildForLens(tsfile, document);
		})();
	}

	public refresh(): void {
		this._eventEmitter.fire();
	}

	private buildForLens(tsfile: TreeSitterFile, document: vscode.TextDocument) {
		let builder = new NamedElementBuilder(tsfile);

		const classRanges: NamedElement[] | TreeSitterFileError = builder.buildClass();
		const methodRanges: NamedElement[] | TreeSitterFileError = builder.buildMethod();
		let lenses: vscode.CodeLens[] = [];

		const testLens = this.setupTestIfNotExists(classRanges.concat(methodRanges), document);
		const chatLens = this.setupQuickChat(methodRanges, document);

		let codeLens = lenses.concat(testLens, chatLens);
		return codeLens;
	}

	private setupTestIfNotExists(methodRanges: NamedElement[], document: vscode.TextDocument): vscode.CodeLens[] {
		return methodRanges.map((namedElement) => {
			if (namedElement.isTestFile()) {
				return;
			}

			const title = l10n.t("AutoTest");
			return new vscode.CodeLens(namedElement.identifierRange, {
				title,
				command: "autodev.autoTest",
				arguments: [document, namedElement, new vscode.WorkspaceEdit()],
			});
		})
			.filter((lens): lens is vscode.CodeLens => !!lens);
	}

	private setupQuickChat(methodRanges: NamedElement[], document: vscode.TextDocument): vscode.CodeLens[] {
		return methodRanges.map((range) => {
			const title = `$(autodev-icon)$(chevron-down)`;
			return new vscode.CodeLens(range.identifierRange, {
				title,
				command: "autodev.action.quickAction",
				arguments: [document, range],
			});
		});
	}
}


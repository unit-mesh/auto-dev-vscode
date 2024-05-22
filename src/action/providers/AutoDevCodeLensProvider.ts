import * as vscode from "vscode";
import { EventEmitter, l10n } from "vscode";

import { SUPPORTED_LANGUAGES, SupportedLanguage } from "../../editor/language/SupportedLanguage";
import { AutoDevExtension } from "../../AutoDevExtension";
import { TreeSitterFile, TreeSitterFileError } from "../../code-context/ast/TreeSitterFile";
import { NamedElement } from "../../editor/ast/NamedElement";
import { createTreeSitterFile } from "../../code-context/ast/TreeSitterWrapper";
import { NamedElementBuilder } from "../../editor/ast/NamedElementBuilder";

export class AutoDevCodeLensProvider implements vscode.CodeLensProvider {
	private _eventEmitter: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
	onDidChangeCodeLenses: vscode.Event<void> = this._eventEmitter.event;

	constructor(private readonly context: AutoDevExtension) {
	}

	provideCodeLenses(
		document: vscode.TextDocument,
		token: vscode.CancellationToken
	): vscode.ProviderResult<vscode.CodeLens[]> {
		return (async () => {
			const languageId = document.languageId as SupportedLanguage;
			if (!SUPPORTED_LANGUAGES.includes(languageId)) {
				return [];
			}

			let tsfile = await createTreeSitterFile(document);
			let codeLens = this.buildForLens(tsfile, document);

			tsfile.onChange(() => {
				this.refresh();
			});

			return codeLens;
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


import * as vscode from "vscode";
import { l10n } from "vscode";

import { SUPPORTED_LANGUAGES, SupportedLanguage } from "../../editor/language/SupportedLanguage";
import { AutoDevExtension } from "../../AutoDevExtension";
import { TreeSitterFile, TreeSitterFileError } from "../../code-context/ast/TreeSitterFile";
import { NamedElement } from "../../editor/ast/NamedElement";
import { NamedElementBuilder } from "../../editor/ast/NamedElementBuilder";
import { TreeSitterFileManager } from "../../editor/cache/TreeSitterFileManager";
import { DefaultLanguageService } from "../../editor/language/service/DefaultLanguageService";

export class AutoDevCodeLensProvider implements vscode.CodeLensProvider, vscode.Disposable {
	private _eventEmitter: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
	onDidChangeCodeLenses: vscode.Event<void> = this._eventEmitter.event;

	private onDidChangeTextDocument: vscode.Disposable;

	constructor(private readonly context: AutoDevExtension) {
		this.onDidChangeTextDocument = vscode.workspace.onDidChangeTextDocument(async (event) => {
			if (SUPPORTED_LANGUAGES.includes(event.document.languageId)) {
				this.refresh();
			}
		});
	}

	dispose() {
		this._eventEmitter.dispose();
		this.onDidChangeTextDocument.dispose();
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

			let tsFileElementBuilder = new NamedElementBuilder(tsfile);
			return this.buildForLens(tsFileElementBuilder, document);
		})();
	}

	public refresh(): void {
		this._eventEmitter.fire();
	}

	private buildForLens(builder: NamedElementBuilder, document: vscode.TextDocument) {

		const classRanges: NamedElement[] | TreeSitterFileError = builder.buildClass();
		const methodRanges: NamedElement[] | TreeSitterFileError = builder.buildMethod();

		let elements = classRanges.concat(methodRanges);
		const testLens = this.setupTestCodeLen(elements, document);
		const chatLens = this.setupQuickChat(elements, document);

		return ([] as vscode.CodeLens[]).concat(testLens, chatLens);
	}

	private setupTestCodeLen(methodRanges: NamedElement[], document: vscode.TextDocument): vscode.CodeLens[] {
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


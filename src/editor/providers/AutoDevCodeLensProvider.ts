import * as vscode from "vscode";
import { l10n } from "vscode";

import { SUPPORTED_LANGUAGES, SupportedLanguage } from "../language/SupportedLanguage";
import { AutoDevExtension } from "../../AutoDevExtension";
import { TreeSitterFileError } from "../../code-context/ast/TreeSitterFile";
import { NamedElement } from "../ast/NamedElement";
import { createNamedElement } from "../../code-context/ast/TreeSitterWrapper";

export class AutoDevCodeLensProvider implements vscode.CodeLensProvider {
	constructor(private readonly context: AutoDevExtension) {
	}

	onDidChangeCodeLenses: vscode.Event<void> | undefined;

	provideCodeLenses(
		document: vscode.TextDocument,
		token: vscode.CancellationToken
	): vscode.ProviderResult<vscode.CodeLens[]> {
		return (async () => {
			const languageId = document.languageId as SupportedLanguage;
			if (!SUPPORTED_LANGUAGES.includes(languageId)) {
				return [];
			}

			const builder = await createNamedElement(document);
			const methodRanges: NamedElement[] | TreeSitterFileError = builder.buildMethod();
			let lenses: vscode.CodeLens[] = [];

			const docLens = this.setupDocIfNoExist(methodRanges, document);
			const chatLens = this.setupQuickChat(methodRanges, document);

			return lenses.concat(docLens, chatLens);
		})();
	}

	private setupDocIfNoExist(methodRanges: NamedElement[], document: vscode.TextDocument): vscode.CodeLens[] {
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


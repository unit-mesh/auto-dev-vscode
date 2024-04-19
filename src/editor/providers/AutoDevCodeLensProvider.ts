import * as vscode from "vscode";
import { SUPPORTED_LANGUAGES, SupportedLanguage } from "../language/SupportedLanguage";
import { AutoDevExtension } from "../../AutoDevExtension";
import { TreeSitterFileError } from "../../code-context/ast/TreeSitterFile";
import { NamedElementBlock } from "../document/NamedElementBlock";
import { BlockBuilder } from "../document/BlockBuilder";
import { documentToTreeSitterFile } from "../../code-context/ast/TreeSitterFileUtil";
import { l10n } from "vscode";

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

			const file = await documentToTreeSitterFile(document);
			const builder = new BlockBuilder(file);
			const methodRanges: NamedElementBlock[] | TreeSitterFileError = builder.buildMethod();
			let lenses: vscode.CodeLens[] = [];

			if (methodRanges instanceof Array) {
				const docLens = this.setupDocIfNoExist(methodRanges, document, languageId);
				const chatLens = this.setupQuickChat(methodRanges, document, languageId);

				lenses = lenses.concat(docLens, chatLens);
			}

			return lenses;
		})();
	}

	private setupDocIfNoExist(methodRanges: NamedElementBlock[], document: vscode.TextDocument, langid: string) {
		return methodRanges.map((range) => {
			const title = l10n.t("autodev.command.generateDoc");
			return new vscode.CodeLens(range.identifierRange, {
				title,
				command: "autodev.generateDoc",
				arguments: [document, range],
			});
		});
	}

	private setupQuickChat(methodRanges: NamedElementBlock[], document: vscode.TextDocument, langid: string) {
		return methodRanges.map((range) => {
			const title = `$(autodev-icon)$(chevron-down)`;
			return new vscode.CodeLens(range.identifierRange, {
				title,
				command: "autodev.action.quickchat",
				arguments: [document, range],
			});
		});
	}
}


import * as vscode from "vscode";
import { SUPPORTED_LANGUAGES, SupportedLanguage } from "../language/SupportedLanguage";
import { parse } from '../parser/TreeSitterParser';
import { AutoDevExtension } from "../AutoDevExtension";
import { documentToTreeSitterFile } from "../semantic/TreeSitterFileUtil";
import { TreeSitterFile, TreeSitterFileError } from "../semantic/TreeSitterFile";
import { IdentifierBlockRange } from "../document/IdentifierBlockRange";

export class AutoDevCodeLensProvider implements vscode.CodeLensProvider {
	constructor(private readonly context: AutoDevExtension) {
	}

	onDidChangeCodeLenses: vscode.Event<void> | undefined;

	provideCodeLenses(
		document: vscode.TextDocument,
		token: vscode.CancellationToken
	): vscode.ProviderResult<vscode.CodeLens[]> {
		return (async () => {
			const langid = document.languageId as SupportedLanguage;
			if (!SUPPORTED_LANGUAGES.includes(langid)) {
				return [];
			}

			const file = await documentToTreeSitterFile(document);
			if (!(file instanceof TreeSitterFile)) {
				return;
			}

			const methodRanges: IdentifierBlockRange[] | TreeSitterFileError = file.methodRanges();
			let lenses: vscode.CodeLens[] = [];

			if (methodRanges instanceof Array) {
				const docLens = this.setupDocIfNoExist(methodRanges, document, langid);
				const chatLens = this.setupQuickChat(methodRanges, document, langid);

				lenses = lenses.concat(docLens, chatLens);
			}

			return lenses;
		})();
	}

	private setupDocIfNoExist(methodRanges: IdentifierBlockRange[], document: vscode.TextDocument, langid: string) {
		return methodRanges.map((range) => {
			const title = range.commentRange ? "更新注释" : "生成注释";
			const lens = new vscode.CodeLens(range.identifierRange, {
				title,
				command: "autodev.generateDoc",
				arguments: [document, range],
			});
			return lens;
		});
	}

	private setupQuickChat(methodRanges: IdentifierBlockRange[], document: vscode.TextDocument, langid: string) {
		return methodRanges.map((range) => {
			const title = `AutoDev$(chevron-down)`;
			const lens = new vscode.CodeLens(range.identifierRange, {
				title,
				command: "autodev.action.quickchat",
				arguments: [document, range],
			});
			return lens;
		});
	}
}


import * as vscode from "vscode";

import { AutoDevContext } from "../autodev-context";
import { SUPPORTED_LANGUAGES } from "../language/supported";
import { TreeSitterFile, TreeSitterFileError, } from "../semantic-treesitter/TreeSitterFile";
import { IdentifierBlockRange } from "../document/IdentifierBlockRange";
import { JavaSemanticLsp } from "../semantic-lsp/java/JavaSemanticLsp";

export class AutoDevActionProvider implements vscode.CodeActionProvider {
	private context: AutoDevContext;

	constructor(context: AutoDevContext) {
		this.context = context;
	}

	static readonly providedCodeActionKinds = [
		vscode.CodeActionKind.RefactorRewrite,
	];

	async provideCodeActions(
		document: vscode.TextDocument,
		range: vscode.Range | vscode.Selection,
		context: vscode.CodeActionContext,
		token: vscode.CancellationToken
	): Promise<vscode.CodeAction[] | null | undefined> {
		const lang = document.languageId;
		if (!SUPPORTED_LANGUAGES.includes(lang)) {return [];}

		const file = await TreeSitterFile.from(document);
		if (!(file instanceof TreeSitterFile)) {return;}

		const methodRanges: IdentifierBlockRange[] | TreeSitterFileError = file.methodRanges();
		let actions: vscode.CodeAction[] = [];
		if (methodRanges instanceof Array) {
			actions = AutoDevActionProvider.buildMethodActions(methodRanges, range, document);
		}

		const classRanges: IdentifierBlockRange[] | TreeSitterFileError = file.classRanges();
		if (classRanges instanceof Array) {
			actions = actions.concat(AutoDevActionProvider.buildClassAction(classRanges, range, document));
		}

		return actions;
	}

	private static buildMethodActions(methodRanges: IdentifierBlockRange[], range: vscode.Range | vscode.Selection, document: vscode.TextDocument) {
		return methodRanges
			.filter(result => result.blockRange.contains(range))
			.map(result => {
				const title = `AutoDoc for method \`${result.identifierRange.text}\` (AutoDev)`;
				return AutoDevActionProvider.createAction(title, document, result);
			});
	}

	private static buildClassAction(classRanges: IdentifierBlockRange[], range: vscode.Range | vscode.Selection, document: vscode.TextDocument) {
		return classRanges
			.filter(result => result.identifierRange.contains(range))
			.map(result => {
				const title = `AutoDoc for class \`${result.identifierRange.text}\` (AutoDev)`;
				return AutoDevActionProvider.createAction(title, document, result);
			});
	}

	private static createAction(title: string, document: vscode.TextDocument, result: IdentifierBlockRange) {
		const codeAction = new vscode.CodeAction(
			title,
			AutoDevActionProvider.providedCodeActionKinds[0]
		);

		codeAction.isPreferred = false;
		codeAction.edit = new vscode.WorkspaceEdit();
		codeAction.command = {
			command: "autodev.generateDoc",
			title: title,
			arguments: [document, result, codeAction.edit]
		};
		return codeAction;
	}

	private static renderWithLsp(context: AutoDevContext) {
		const lsp = new JavaSemanticLsp(context);
		const client = lsp?.getLanguageClient();
		console.log(client);
	}
}

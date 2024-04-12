import * as vscode from "vscode";

import { AutoDevExtension } from "../AutoDevExtension";
import { SUPPORTED_LANGUAGES } from "../language/SupportedLanguage";
import { TreeSitterFile, TreeSitterFileError, } from "../semantic/TreeSitterFile";
import { IdentifierBlockRange } from "../document/IdentifierBlockRange";
import { JavaSemanticLsp } from "../semantic-lsp/java/JavaSemanticLsp";

export class AutoDevActionProvider implements vscode.CodeActionProvider {
	private context: AutoDevExtension;

	constructor(context: AutoDevExtension) {
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
		let methodDocActions = methodRanges
			.filter(result => result.blockRange.contains(range))
			.map(result => {
				const title = `AutoDoc for method \`${result.identifierRange.text}\` (AutoDev)`;
				return AutoDevActionProvider.createDocAction(title, document, result);
			});

		// TODO: merge this with the above map
		methodRanges
			.filter(result => result.blockRange.contains(range))
			.forEach(result => {
			const title = `Api analysis for method \`${result.identifierRange.text}\` (AutoDev)`;
			const codeAction = new vscode.CodeAction(
				title,
				AutoDevActionProvider.providedCodeActionKinds[0]
			);
			codeAction.isPreferred = false;
			codeAction.edit = new vscode.WorkspaceEdit();
			codeAction.command = {
				command: "autodev.genApiData",
				title: title,
				arguments: [document, result, codeAction.edit]
			};
			methodDocActions.push(codeAction);
		});

		return methodDocActions;
	}

	private static buildClassAction(classRanges: IdentifierBlockRange[], range: vscode.Range | vscode.Selection, document: vscode.TextDocument) {
		return classRanges
			.filter(result => result.identifierRange.contains(range))
			.map(result => {
				const title = `AutoDoc for class \`${result.identifierRange.text}\` (AutoDev)`;
				return AutoDevActionProvider.createDocAction(title, document, result);
			});
	}

	private static createDocAction(title: string, document: vscode.TextDocument, result: IdentifierBlockRange) {
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

	private static renderWithLsp(context: AutoDevExtension) {
		const lsp = new JavaSemanticLsp(context);
		const client = lsp?.getLanguageClient();
		console.log(client);
	}
}

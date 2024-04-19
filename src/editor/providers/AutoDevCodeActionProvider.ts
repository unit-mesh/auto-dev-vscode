import * as vscode from "vscode";

import { AutoDevExtension } from "../../AutoDevExtension";
import { SUPPORTED_LANGUAGES } from "../language/SupportedLanguage";
import { TreeSitterFileError, } from "../../code-context/ast/TreeSitterFile";
import { NamedElementBlock } from "../document/NamedElementBlock";
import { JavaSemanticLsp } from "../language/semantic-lsp/java/JavaSemanticLsp";
import { documentToTreeSitterFile } from "../../code-context/ast/TreeSitterFileUtil";
import { BlockBuilder } from "../document/BlockBuilder";

export class AutoDevCodeActionProvider implements vscode.CodeActionProvider {
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
		if (!SUPPORTED_LANGUAGES.includes(lang)) {
			return [];
		}

		const file = await documentToTreeSitterFile(document);
		let blockBuilder = new BlockBuilder(file);

		const methodRanges: NamedElementBlock[] | TreeSitterFileError = blockBuilder.buildMethod();
		const classRanges: NamedElementBlock[] | TreeSitterFileError = blockBuilder.buildClass();

		let actions: vscode.CodeAction[] = [];

		if (methodRanges instanceof Array) {
			actions = this.buildMethodActions(methodRanges, range, document, lang);
		} else if (classRanges instanceof Array) {
			let classAction = this.buildClassAction(classRanges, range, document);
			actions = actions.concat(classAction);
		}

		return actions;
	}

	private buildMethodActions(methodRanges: NamedElementBlock[], range: vscode.Range | vscode.Selection, document: vscode.TextDocument, lang: string):
		vscode.CodeAction[] {
		let methodDocActions = methodRanges
			.filter(result => result.blockRange.contains(range))
			.map(result => {
				const title = `AutoDoc for method \`${result.identifierRange.text}\` (AutoDev)`;
				return AutoDevCodeActionProvider.createDocAction(title, document, result);
			});


		let apisDocActions: vscode.CodeAction[] = [];
		if (this.context.structureProvider?.getStructurer(lang)) {
			apisDocActions = methodRanges
				.filter(result => result.blockRange.contains(range))
				.map(result => {
					const title = `Gen API Data for \`${result.identifierRange.text}\` (AutoDev)`;
					return AutoDevCodeActionProvider.createGenApiDataAction(title, result, document);
				});
		}

		// auto test
		let testActions: vscode.CodeAction[] = methodRanges
			.filter(result => result.blockRange.contains(range))
			.map(result => {
				const title = `AutoTest for method \`${result.identifierRange.text}\` (AutoDev)`;
				return AutoDevCodeActionProvider.createAutoTestAction(title, document, result);
			});

		return methodDocActions.concat(apisDocActions).concat(testActions);
	}

	private buildClassAction(classRanges: NamedElementBlock[], range: vscode.Range | vscode.Selection, document: vscode.TextDocument) {
		const docs = classRanges
			.filter(result => result.identifierRange.contains(range))
			.map(result => {
				const title = `AutoDoc for class \`${result.identifierRange.text}\` (AutoDev)`;
				return AutoDevCodeActionProvider.createDocAction(title, document, result);
			});

		let testActions: vscode.CodeAction[] = classRanges
			.filter(named => named.identifierRange.contains(range))
			.map(result => {
				const title = `AutoTest for class \`${result.identifierRange.text}\` (AutoDev)`;
				return AutoDevCodeActionProvider.createAutoTestAction(title, document, result);
			});

		return docs.concat(testActions);
	}

	private static createGenApiDataAction(title: string, result: NamedElementBlock, document: vscode.TextDocument): vscode.CodeAction {
		const codeAction = new vscode.CodeAction(
			title,
			AutoDevCodeActionProvider.providedCodeActionKinds[0]
		);
		codeAction.isPreferred = false;
		codeAction.edit = new vscode.WorkspaceEdit();
		codeAction.command = {
			command: "autodev.genApiData",
			title: title,
			arguments: [document, result, codeAction.edit]
		};

		return codeAction;
	}

	private static createDocAction(title: string, document: vscode.TextDocument, result: NamedElementBlock): vscode.CodeAction {
		const codeAction = new vscode.CodeAction(
			title,
			AutoDevCodeActionProvider.providedCodeActionKinds[0]
		);

		codeAction.isPreferred = false;
		codeAction.edit = new vscode.WorkspaceEdit();
		codeAction.command = {
			command: "autodev.autoComment",
			title: title,
			arguments: [document, result, codeAction.edit]
		};

		return codeAction;
	}

	private static createAutoTestAction(title: string, document: vscode.TextDocument, result: NamedElementBlock) {
		const codeAction = new vscode.CodeAction(
			title,
			AutoDevCodeActionProvider.providedCodeActionKinds[0]
		);

		codeAction.isPreferred = false;
		codeAction.edit = new vscode.WorkspaceEdit();
		codeAction.command = {
			command: "autodev.autoTest",
			title: title,
			arguments: [document, result, codeAction.edit]
		};

		return codeAction;
	}
}
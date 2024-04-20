import * as vscode from "vscode";

import { AutoDevExtension } from "../../AutoDevExtension";
import { SUPPORTED_LANGUAGES } from "../language/SupportedLanguage";
import { TreeSitterFileError, } from "../../code-context/ast/TreeSitterFile";
import { NamedElementBlock } from "../document/NamedElementBlock";
import { documentToTreeSitterFile } from "../../code-context/ast/TreeSitterFileUtil";
import { BlockBuilder } from "../document/BlockBuilder";
import { providerContainer } from "../../ProviderContainer.config";
import { PROVIDER_TYPES } from "../../ProviderTypes";
import { ActionCreator } from "../action/_base/ActionCreator";
import { ActionCreatorContext } from "../action/_base/ActionCreatorContext";

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

		let allRanges: NamedElementBlock[] = [];
		if (methodRanges instanceof Array) {
			allRanges = allRanges.concat(methodRanges);
		} else if (classRanges instanceof Array) {
			allRanges = allRanges.concat(classRanges);
		}

		const creatorContext: ActionCreatorContext = {
			document: document,
			lang: lang,
			namedElementBlocks: allRanges,
			range: range
		};

		let actionCreators = providerContainer.getAll<ActionCreator>(PROVIDER_TYPES.ActionCreator);
		let creators = actionCreators
			.filter(item => item.isApplicable(creatorContext))
			.map(item => item.build(creatorContext));

		let actions: vscode.CodeAction[] = [];
		for (const items of creators) {
			for (let codeAction of (await items)) {
				actions.push(codeAction);
			}
		}

		return actions;
	}
}

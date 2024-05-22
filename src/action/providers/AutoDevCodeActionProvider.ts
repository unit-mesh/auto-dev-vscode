import * as vscode from "vscode";

import { AutoDevExtension } from "../../AutoDevExtension";
import { SUPPORTED_LANGUAGES } from "../../editor/language/SupportedLanguage";
import { NamedElement } from "../../editor/ast/NamedElement";
import { providerContainer } from "../../ProviderContainer.config";
import { PROVIDER_TYPES } from "../../ProviderTypes";
import { ActionCreator } from "../_base/ActionCreator";
import { ActionCreatorContext } from "../_base/ActionCreatorContext";
import { createNamedElement } from "../../code-context/ast/TreeSitterWrapper";

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

		let blockBuilder = await createNamedElement(document);

		const methodRanges: NamedElement[] = blockBuilder.buildMethod();
		const classRanges: NamedElement[] = blockBuilder.buildClass();

		let allRanges: NamedElement[] = [];
		allRanges = allRanges.concat(methodRanges, classRanges);

		if (allRanges.length === 0) {
			return [];
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
			.map(item => item.buildActions(creatorContext));

		let actions: vscode.CodeAction[] = [];
		for (const items of creators) {
			for (let codeAction of (await items)) {
				actions.push(codeAction);
			}
		}

		return actions;
	}
}

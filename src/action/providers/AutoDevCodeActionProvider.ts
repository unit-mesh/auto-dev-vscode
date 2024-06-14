import * as vscode from 'vscode';

import { SUPPORTED_LANGUAGES } from 'base/common/languages/languages';

import { AutoDevExtension } from '../../AutoDevExtension';
import { createNamedElement } from '../../code-context/ast/TreeSitterWrapper';
import { NamedElement } from '../../editor/ast/NamedElement';
import { providerContainer } from '../../ProviderContainer.config';
import { IActionCreator } from '../../ProviderTypes';
import { ActionCreatorContext } from '../_base/ActionCreatorContext';

export class AutoDevCodeActionProvider implements vscode.CodeActionProvider {
	static readonly providedCodeActionKinds = [vscode.CodeActionKind.RefactorRewrite];

	constructor(private autodev: AutoDevExtension) {}

	async provideCodeActions(
		document: vscode.TextDocument,
		range: vscode.Range | vscode.Selection,
		context: vscode.CodeActionContext,
		token: vscode.CancellationToken,
	): Promise<vscode.CodeAction[] | null | undefined> {
		const lang = document.languageId;
		if (!SUPPORTED_LANGUAGES.includes(lang)) {
			return [];
		}

		let blockBuilder = await createNamedElement(this.autodev.treeSitterFileManager, document);

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
			range: range,
		};

		let actionCreators = providerContainer.getAll(IActionCreator);
		let creators = actionCreators
			.filter(item => item.isApplicable(creatorContext))
			.map(item => item.buildActions(creatorContext));

		let actions: vscode.CodeAction[] = [];
		for (const items of creators) {
			for (let codeAction of await items) {
				actions.push(codeAction);
			}
		}

		return actions;
	}
}

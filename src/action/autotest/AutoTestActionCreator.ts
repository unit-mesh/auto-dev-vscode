import { injectable } from 'inversify';
import vscode from 'vscode';

import { NamedElement } from '../../editor/ast/NamedElement';
import { ActionCreatorContext } from '../_base/ActionCreatorContext';
import { CodeActionCreator } from '../_base/CodeActionCreator';

@injectable()
export class AutoTestActionCreator extends CodeActionCreator {
	static readonly providedCodeActionKinds = [vscode.CodeActionKind.RefactorRewrite];

	isApplicable(creatorContext: ActionCreatorContext): boolean {
		return true;
	}

	buildClassAction(context: ActionCreatorContext, nameBlock: NamedElement): vscode.CodeAction | undefined {
		if (nameBlock.isTestFile()) {
			return;
		}

		const title = `AutoTest for class \`${nameBlock.identifierRange.text}\` (AutoDev)`;
		return this.createAutoTestAction(title, context.document, nameBlock);
	}

	buildMethodAction(context: ActionCreatorContext, nameBlock: NamedElement): vscode.CodeAction | undefined {
		if (nameBlock.isTestFile()) {
			return;
		}
		const title = `AutoTest for method \`${nameBlock.identifierRange.text}\` (AutoDev)`;
		return this.createAutoTestAction(title, context.document, nameBlock);
	}

	private createAutoTestAction(
		title: string,
		document: vscode.TextDocument,
		namedElement: NamedElement,
	): vscode.CodeAction {
		const codeAction = new vscode.CodeAction(title, AutoTestActionCreator.providedCodeActionKinds[0]);

		codeAction.isPreferred = false;
		codeAction.edit = new vscode.WorkspaceEdit();
		codeAction.command = {
			command: 'autodev.autoTest',
			title: title,
			arguments: [document, namedElement, codeAction.edit],
		};

		return codeAction;
	}
}

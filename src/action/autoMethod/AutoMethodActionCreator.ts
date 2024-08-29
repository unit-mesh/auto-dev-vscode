import { injectable } from 'inversify';
import vscode from 'vscode';

import { NamedElement } from '../../editor/ast/NamedElement';
import { ActionCreatorContext } from '../_base/ActionCreatorContext';
import { CodeActionCreator } from '../_base/CodeActionCreator';
import { CMD_GEN_CODE_METHOD_COMPLETIONS } from 'base/common/configuration/configuration';

@injectable()
export class AutoMethodActionCreator extends CodeActionCreator {
	static readonly providedCodeActionKinds = [vscode.CodeActionKind.RefactorRewrite];

	isApplicable(creatorContext: ActionCreatorContext): boolean {
		return true;
	}

	buildClassAction(context: ActionCreatorContext, elementBlock: NamedElement) {
		const title = `AutoDoc for class \`${elementBlock.identifierRange.text}\` (AutoDev)`;
		return this.createMethodAction(title, context.document, elementBlock);
	}

	buildMethodAction(context: ActionCreatorContext, elementBlock: NamedElement): vscode.CodeAction {
		const title = `AutoDoc for method \`${elementBlock.identifierRange.text}\` (AutoDev)`;
		return this.createMethodAction(title, context.document, elementBlock);
	}

	private createMethodAction(title: string, document: vscode.TextDocument, block: NamedElement): vscode.CodeAction {
		const codeAction = new vscode.CodeAction(title, AutoMethodActionCreator.providedCodeActionKinds[0]);

		codeAction.isPreferred = false;
		codeAction.edit = new vscode.WorkspaceEdit();
		codeAction.command = {
			command: CMD_GEN_CODE_METHOD_COMPLETIONS,
			title: title,
			arguments: [document, block, codeAction.edit],
		};

		return codeAction;
	}
}

import vscode from "vscode";
import { injectable } from "inversify";

import { CodeActionCreator } from "../_base/ActionCreator";
import { ActionCreatorContext } from "../_base/ActionCreatorContext";
import { NamedElementBlock } from "../../document/NamedElementBlock";

@injectable()
export class AutoTestActionCreator extends CodeActionCreator {
	static readonly providedCodeActionKinds = [
		vscode.CodeActionKind.RefactorRewrite,
	];

	buildClassAction(context: ActionCreatorContext, nameBlock: NamedElementBlock): vscode.CodeAction {
		const title = `AutoTest for class \`${nameBlock.identifierRange.text}\` (AutoDev)`;
		return this.createAutoTestAction(title, context.document, nameBlock);
	}

	buildMethodAction(context: ActionCreatorContext, nameBlock: NamedElementBlock): vscode.CodeAction {
		const title = `AutoTest for method \`${nameBlock.identifierRange.text}\` (AutoDev)`;
		return this.createAutoTestAction(title, context.document, nameBlock);
	}

	private createAutoTestAction(title: string, document: vscode.TextDocument, result: NamedElementBlock): vscode.CodeAction {
		const codeAction = new vscode.CodeAction(title, AutoTestActionCreator.providedCodeActionKinds[0]);

		codeAction.isPreferred = false;
		codeAction.edit = new vscode.WorkspaceEdit();
		codeAction.command = {
			command: "autodev.autoComment",
			title: title,
			arguments: [document, result, codeAction.edit]
		};

		return codeAction;
	}
}
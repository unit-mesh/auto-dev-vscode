import { injectable } from "inversify";
import vscode from "vscode";

import { CodeActionCreator } from "../_base/ActionCreator";
import { NamedElementBlock } from "../../document/NamedElementBlock";
import { ActionCreatorContext } from "../_base/ActionCreatorContext";

@injectable()
export class AutoDocActionCreator extends CodeActionCreator {
	static readonly providedCodeActionKinds = [
		vscode.CodeActionKind.RefactorRewrite,
	];

	buildClassAction(context: ActionCreatorContext, nameBlock: NamedElementBlock) {
		const title = `AutoDoc for class \`${nameBlock.identifierRange.text}\` (AutoDev)`;
		return this.createDocAction(title, context.document, nameBlock);
	}

	buildMethodAction(context: ActionCreatorContext, nameBlock: NamedElementBlock): vscode.CodeAction {
		const title = `AutoDoc for method \`${nameBlock.identifierRange.text}\` (AutoDev)`;
		return this.createDocAction(title, context.document, nameBlock);
	}

	private createDocAction(title: string, document: vscode.TextDocument, result: NamedElementBlock): vscode.CodeAction {
		const codeAction = new vscode.CodeAction(title, AutoDocActionCreator.providedCodeActionKinds[0]);

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

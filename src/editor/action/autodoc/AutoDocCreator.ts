import { injectable } from "inversify";
import vscode from "vscode";

import { ActionCreator } from "../_base/ActionCreator";
import { CodeElementType } from "../../codemodel/CodeElementType";
import { NamedElementBlock } from "../../document/NamedElementBlock";
import { ActionCreatorContext } from "../_base/ActionCreatorContext";

@injectable()
export class AutoDocCreator implements ActionCreator {
	static readonly providedCodeActionKinds = [
		vscode.CodeActionKind.RefactorRewrite,
	];

	build(context: ActionCreatorContext): Promise<vscode.CodeAction[]> {
		let apisDocActions: vscode.CodeAction[] = [];
		for (let nameBlock of context.namedElementBlocks) {
			switch (nameBlock.codeElementType) {
				case CodeElementType.Structure:
					if (nameBlock.identifierRange.contains(context.range)) {
						apisDocActions.push(this.buildClassAction(context, nameBlock));
					}
					break;
				case CodeElementType.Method:
					if (nameBlock.blockRange.contains(context.range)) {
						apisDocActions.push(this.buildMethodAction(context, nameBlock));
					}
					break;
				default:
					break;
			}
		}

		return Promise.resolve(apisDocActions);
	}

	private buildClassAction(context: ActionCreatorContext, nameBlock: NamedElementBlock) {
		const title = `AutoDoc for class \`${nameBlock.identifierRange.text}\` (AutoDev)`;
		return this.createDocAction(title, context.document, nameBlock);
	}

	private buildMethodAction(context: ActionCreatorContext, nameBlock: NamedElementBlock): vscode.CodeAction {
		const title = `AutoDoc for method \`${nameBlock.identifierRange.text}\` (AutoDev)`;
		return this.createDocAction(title, context.document, nameBlock);
	}

	private createDocAction(title: string, document: vscode.TextDocument, result: NamedElementBlock): vscode.CodeAction {
		const codeAction = new vscode.CodeAction(title, AutoDocCreator.providedCodeActionKinds[0]);

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

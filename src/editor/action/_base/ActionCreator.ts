import vscode from "vscode";

import { ActionCreatorContext } from "./ActionCreatorContext";
import { CodeElementType } from "../../codemodel/CodeElementType";
import { NamedElementBlock } from "../../document/NamedElementBlock";

export interface ActionCreator {
	build(context: ActionCreatorContext): Promise<vscode.CodeAction[]>;
}

export abstract class CodeActionCreator implements ActionCreator {
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

	abstract buildClassAction(context: ActionCreatorContext, nameBlock: NamedElementBlock): vscode.CodeAction;

	abstract buildMethodAction(context: ActionCreatorContext, nameBlock: NamedElementBlock): vscode.CodeAction;
}

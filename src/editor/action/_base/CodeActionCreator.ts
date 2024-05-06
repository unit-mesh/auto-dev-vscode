import { injectable } from "inversify";
import { ActionCreatorContext } from "./ActionCreatorContext";
import vscode from "vscode";
import { CodeElementType } from "../../codemodel/CodeElementType";
import { NamedElement } from "../../ast/NamedElement";
import { ActionCreator } from "./ActionCreator";

@injectable()
export abstract class CodeActionCreator implements ActionCreator {
	isApplicable(creatorContext: ActionCreatorContext): boolean {
		return true;
	}

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

	abstract buildClassAction(context: ActionCreatorContext, elementBlock: NamedElement): vscode.CodeAction;

	abstract buildMethodAction(context: ActionCreatorContext, elementBlock: NamedElement): vscode.CodeAction;
}
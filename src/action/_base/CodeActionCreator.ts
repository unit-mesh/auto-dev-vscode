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

	/**
	 * The `buildActions` method is used to generate an array of `vscode.CodeAction` objects based on the provided `ActionCreatorContext`.
	 *
	 * @param {ActionCreatorContext} context - The context in which the actions are to be created. This context includes named element blocks, each with a code element type and a range.
	 *
	 * @returns {Promise<vscode.CodeAction[]>} - Returns a promise that resolves with an array of `vscode.CodeAction` objects. The actions are created based on the named element blocks in the provided context. If a block's code element type is 'Structure' and its identifier range contains the context range, a class action is built. If a block's code element type is 'Method' and its block range contains the context range, a method action is built. Blocks with other code element types are ignored.
	 *
	 * @throws {Error} - Throws an error if the provided context is not valid or if an error occurs while building the actions.
	 *
	 * This method is asynchronous and should be awaited or used with a `.then()` function to handle the returned promise.
	 *
	 * Note: This method is part of the Visual Studio Code Extension API and is used for creating code actions that can be provided by a `CodeActionProvider`.
	 */
	buildActions(context: ActionCreatorContext): Promise<vscode.CodeAction[]> {
		let actions: vscode.CodeAction[] = [];
		for (let nameBlock of context.namedElementBlocks) {
			switch (nameBlock.codeElementType) {
				case CodeElementType.Structure:
					if (nameBlock.identifierRange.contains(context.range)) {
						let classAction = this.buildClassAction(context, nameBlock);
						if (classAction)  {
							actions.push(classAction);
						}
					}
					break;
				case CodeElementType.Method:
					if (nameBlock.blockRange.contains(context.range)) {
						let methodAction = this.buildMethodAction(context, nameBlock);
						if (methodAction) {
							actions.push(methodAction);
						}
					}
					break;
				default:
					break;
			}
		}

		return Promise.resolve(actions);
	}

	abstract buildClassAction(context: ActionCreatorContext, elementBlock: NamedElement): vscode.CodeAction | undefined;

	abstract buildMethodAction(context: ActionCreatorContext, elementBlock: NamedElement): vscode.CodeAction | undefined;
}
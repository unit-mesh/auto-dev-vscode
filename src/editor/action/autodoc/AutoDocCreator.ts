import { injectable } from "inversify";

import { ActionCreator, ActionCreatorContext } from "../_base/ActionCreator";
import vscode from "vscode";
import { AutoDevExtension } from "../../../AutoDevExtension";

@injectable()
export class AutoDocCreator implements ActionCreator {
	build(extension: AutoDevExtension, context: ActionCreatorContext): Promise<vscode.CodeAction[]> {
		let apisDocActions: vscode.CodeAction[] = [];

		return Promise.resolve([]);
	}
}

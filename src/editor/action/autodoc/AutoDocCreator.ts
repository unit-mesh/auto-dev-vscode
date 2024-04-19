import { injectable } from "inversify";
import vscode from "vscode";

import { ActionCreator, ActionCreatorContext } from "../_base/ActionCreator";
import { AutoDevExtension } from "../../../AutoDevExtension";

@injectable()
export class AutoDocCreator implements ActionCreator {
	build(extension: AutoDevExtension, context: ActionCreatorContext): Promise<vscode.CodeAction[]> {
		let apisDocActions: vscode.CodeAction[] = [];

		return Promise.resolve([]);
	}
}

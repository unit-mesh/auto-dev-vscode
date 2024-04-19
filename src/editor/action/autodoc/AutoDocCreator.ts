import { CodeAction } from "vscode";
import { injectable } from "inversify";

import { ActionCreator, ActionCreatorContext } from "../_base/ActionCreator";

@injectable()
export class AutoDocCreator implements ActionCreator {
	build(context: ActionCreatorContext): Promise<CodeAction[]> {
		throw new Error("Methoad not implemented.");
	}
}

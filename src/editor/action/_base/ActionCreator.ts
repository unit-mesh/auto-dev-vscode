import vscode from "vscode";

import { ActionCreatorContext } from "./ActionCreatorContext";

export interface ActionCreator {
	build(context: ActionCreatorContext): Promise<vscode.CodeAction[]>;
}


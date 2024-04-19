import vscode from "vscode";
import { NamedElementBlock } from "../../document/NamedElementBlock";

export interface ActionCreatorContext {
	methodRanges: NamedElementBlock[],
	range: vscode.Range | vscode.Selection,
	document: vscode.TextDocument,
	lang: string
}

export interface ActionCreator {
	build(context: ActionCreatorContext): Promise<vscode.CodeAction[]>;
}


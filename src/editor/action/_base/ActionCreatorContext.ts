import vscode from "vscode";

import { NamedElementBlock } from "../../document/NamedElementBlock";

export interface ActionCreatorContext {
	namedElementBlocks: NamedElementBlock[],
	range: vscode.Range | vscode.Selection,
	document: vscode.TextDocument,
	lang: string
}
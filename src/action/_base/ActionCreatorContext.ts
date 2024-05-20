import vscode from "vscode";

import { NamedElement } from "../../editor/ast/NamedElement";

export interface ActionCreatorContext {
	namedElementBlocks: NamedElement[],
	range: vscode.Range | vscode.Selection,
	document: vscode.TextDocument,
	lang: string
}
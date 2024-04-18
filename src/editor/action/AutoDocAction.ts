import vscode from "vscode";
import { IdentifierBlockRange } from "../document/IdentifierBlockRange";

export interface AutoDocContext {
	language: string;
	startSymbol: string;
	endSymbol: string;
	code: string;
	forbiddenRules: string[];
}

export class AutoDocAction {
	document: vscode.TextDocument;
	range: IdentifierBlockRange;
	edit: vscode.WorkspaceEdit;

	constructor(document: vscode.TextDocument, range: IdentifierBlockRange, edit: vscode.WorkspaceEdit) {
		this.document = document;
		this.range = range;
		this.edit = edit;
	}

	execute() {
		// LlmProvider.instance().streamChat();
	}
}

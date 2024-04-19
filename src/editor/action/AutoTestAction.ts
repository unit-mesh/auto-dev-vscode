import { Action } from "./Action";
import vscode from "vscode";
import { IdentifierBlockRange } from "../document/IdentifierBlockRange";

export class AutoTestAction implements Action {
	private document: vscode.TextDocument;
	private range: IdentifierBlockRange;
	private edit: vscode.WorkspaceEdit;
	private language: string;

	constructor(document: vscode.TextDocument, range: IdentifierBlockRange, edit: vscode.WorkspaceEdit) {
		this.document = document;
		this.range = range;
		this.edit = edit;
		this.language = document.languageId;
	}

	execute(): Promise<void> {
		throw new Error("Method not implemented.");
	}
}
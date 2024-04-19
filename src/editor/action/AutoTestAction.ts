import { Action } from "./Action";
import vscode from "vscode";
import { IdentifierBlock } from "../document/IdentifierBlock";

export class AutoTestAction implements Action {
	private document: vscode.TextDocument;
	private range: IdentifierBlock;
	private edit: vscode.WorkspaceEdit;
	private language: string;

	constructor(document: vscode.TextDocument, range: IdentifierBlock, edit: vscode.WorkspaceEdit) {
		this.document = document;
		this.range = range;
		this.edit = edit;
		this.language = document.languageId;
	}

	execute(): Promise<void> {
		throw new Error("Method not implemented.");
	}
}
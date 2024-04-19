import { Action } from "./Action";
import vscode from "vscode";
import { NamedElementBlock } from "../document/NamedElementBlock";

export class AutoTestAction implements Action {
	private document: vscode.TextDocument;
	private range: NamedElementBlock;
	private edit: vscode.WorkspaceEdit;
	private language: string;

	constructor(document: vscode.TextDocument, range: NamedElementBlock, edit: vscode.WorkspaceEdit) {
		this.document = document;
		this.range = range;
		this.edit = edit;
		this.language = document.languageId;
	}

	execute(): Promise<void> {
		throw new Error("Method not implemented.");
	}
}
import vscode from "vscode";

import { NamedElementBlock } from "../../document/NamedElementBlock";
import { ActionExecutor } from "../_base/ActionExecutor";
import { TemplateContext } from "../../../prompt-manage/template/TemplateContext";

export interface TestDataTemplateContext extends TemplateContext {
	baseUrl?: string;
	requestStructure: string;
	responseStructure: string;
	selectedText: string;
}

export class GenTestDataActionExecutor implements ActionExecutor {
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

	async execute() {


	}
}

import vscode from "vscode";

import { NamedElement } from "../../ast/NamedElement";
import { ActionExecutor } from "../_base/ActionExecutor";
import { TemplateContext } from "../../../prompt-manage/template/TemplateContext";
import { ActionType } from "../../../prompt-manage/ActionType";

export interface TestDataTemplateContext extends TemplateContext {
	baseUrl?: string;
	requestStructure: string;
	responseStructure: string;
	selectedText: string;
}

export class GenApiDataActionExecutor implements ActionExecutor {
	type: ActionType = ActionType.GenApiData;

	private document: vscode.TextDocument;
	private range: NamedElement;
	private edit: vscode.WorkspaceEdit;
	private language: string;

	constructor(document: vscode.TextDocument, range: NamedElement, edit: vscode.WorkspaceEdit) {
		this.document = document;
		this.range = range;
		this.edit = edit;
		this.language = document.languageId;
	}

	async execute() {
		// getTreePathAtCursor()
		const context: TestDataTemplateContext = {
			language: this.language,
			baseUrl: '',
			requestStructure: '',
			responseStructure: '',
			selectedText: '',
		};
	}
}

import { Action } from "./Action";
import vscode from "vscode";

import { NamedElementBlock } from "../document/NamedElementBlock";
import { TestGenProviderManager } from "../../code-context/TestGenProviderManager";

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

	async execute(): Promise<void> {
		let testgen = TestGenProviderManager.getInstance();
		let provider = await testgen.provide(this.language);

		if (provider?.isApplicable(this.language) === true) {
			let testContext = await provider.findOrCreateTestFile(this.document, this.range);
			console.log(testContext);
		}
	}
}
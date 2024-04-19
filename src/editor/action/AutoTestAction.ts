import { Action } from "./Action";
import vscode from "vscode";
import { NamedElementBlock } from "../document/NamedElementBlock";
import { TestGenProviderManager } from "../../code-context/TestGenProviderManager";
import { TestGenContext } from "../../code-context/_base/test/TestGenContext";
import { StructurerProviderManager } from "../../code-context/StructurerProviderManager";

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

		// const context: TestGenContext = {
		// 	currentObject: undefined,
		// 	isNewFile: false,
		// 	language: "",
		// 	relatedClasses: [],
		// 	testClassName: ""
		// }
		//
		// if (provider?.isApplicable(this.language) === true) {
		// 	let testFile = provider.findOrCreateTestFile(this.document.uri, this.range)
		//
		// }
	}
}
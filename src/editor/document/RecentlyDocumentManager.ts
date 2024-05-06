import vscode, { TextDocument } from "vscode";
import { SupportedLanguage } from "../language/SupportedLanguage";

export class RecentlyDocumentManager {
	private openTextDocuments: TextDocument[] = [];
	private closedTextDocuments: TextDocument[] = [];
	private currentDocument: TextDocument | undefined;

	constructor() {
		this.openTextDocuments = [];
		this.closedTextDocuments = [];
	}

	getOpenTextDocuments() {
		return this.openTextDocuments;
	}

	pushTextDocument(document: TextDocument) {
		this.openTextDocuments.push(document);
	}

	getClosedTextDocuments() {
		return this.closedTextDocuments;
	}

	getCurrentDocument() {
		return this.currentDocument;
	}

	filterByLanguage(language: SupportedLanguage): TextDocument[] {
		return this.openTextDocuments.filter((document) => document.languageId === language);
	}

	updateCurrentDocument(document: TextDocument) {
		if (this.currentDocument) {
			this.closedTextDocuments.push(this.currentDocument);
		}

		this.pushTextDocument(document);
		this.currentDocument = document;
	}

	bindChanges() {
		vscode.window.onDidChangeActiveTextEditor(
			async (editor: vscode.TextEditor | undefined) => {
				if (!editor) {
					return;
				}

				this.updateCurrentDocument(editor.document);
			}
		);

		vscode.workspace.onDidCloseTextDocument(async (document: vscode.TextDocument) => {
			// todos: remove document from cache
		});
	}
}

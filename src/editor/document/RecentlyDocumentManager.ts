import { TextDocument } from "vscode";
import { SupportedLanguage } from "../../language/SupportedLanguage";

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
}

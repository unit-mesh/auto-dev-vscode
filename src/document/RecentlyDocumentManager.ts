import { TextDocument } from "vscode";

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

	putOpenTextDocument(document: TextDocument) {
		this.openTextDocuments.push(document);
	}

	getClosedTextDocuments() {
		return this.closedTextDocuments;
	}

	getCurrentDocument() {
		return this.currentDocument;
	}

	updateCurrentDocument(document: TextDocument) {
      if (this.currentDocument) {
        this.closedTextDocuments.push(this.currentDocument);
      }

      this.putOpenTextDocument(document);
      this.currentDocument = document;
	}
}

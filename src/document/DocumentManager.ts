import { TextDocument, Uri } from "vscode";

export class DocumentManager {
    private openTextDocuments = [];
    private closedTextDocuments = [];
        // current document
    private currentDocument: TextDocument | undefined;

    constructor() {
        this.openTextDocuments = [];
        this.closedTextDocuments = [];
    }

    getOpenTextDocuments() {
        return this.openTextDocuments;
    }

    getClosedTextDocuments() {
        return this.closedTextDocuments;
    }

    getCurrentDocument() {
        return this.currentDocument;
    }

    setCurrentDocument(document: TextDocument) {
        this.currentDocument = document;
    }
}

import { TextDocument, Uri } from "vscode";

export interface SimilarSearchElement {
	uri: Uri,
	beforeCursor: string,
	afterCursor: string,
	languageId: string,
	path: string,
	document: TextDocument
}


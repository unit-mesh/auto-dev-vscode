import vscode, { TextDocument, TextEditor } from "vscode";
import { SimilarSearchElement } from "./SimilarSearchElement";

/**
 * The `SearchElementGenerator` class is used to generate a search element from a given text editor.
 * This class is part of the Visual Studio Code (vscode) extension API.
 */
export class SimilarSearchElementBuilder {
	private editor: vscode.TextEditor;

	constructor(editor: vscode.TextEditor) {
		this.editor = editor;
	}

	build(): SimilarSearchElement {
		const document = this.editor.document;
		const cursorPosition = this.editor.selection.active;
		const beforeCursor = this.getBeforeCursor(document, cursorPosition);
		const afterCursor = this.getAfterCursor(document, cursorPosition);
		const languageId = document.languageId;
		const uri = document.uri;
		const path = uri.path;

		return {
			uri,
			beforeCursor,
			afterCursor,
			languageId,
			path,
			document
		};
	}

	private getBeforeCursor(document: TextDocument, cursorPosition: vscode.Position): string {
		const start = new vscode.Position(cursorPosition.line, 0);
		const range = new vscode.Range(start, cursorPosition);
		return document.getText(range);
	}

	private getAfterCursor(document: TextDocument, cursorPosition: vscode.Position): string {
		const end = new vscode.Position(cursorPosition.line, document.lineAt(cursorPosition.line).range.end.character);
		const range = new vscode.Range(cursorPosition, end);
		return document.getText(range);
	}

	static from(activeTextEditor: TextEditor | undefined) {
		if (!activeTextEditor) {
			throw new Error("No active text editor found");
		}

		return new SimilarSearchElementBuilder(activeTextEditor);
	}
}
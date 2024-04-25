import { TemplateContext } from "../template/TemplateContext";
import { NamedElement } from "../../editor/ast/NamedElement";
import vscode from "vscode";
import { NamedElementBuilder } from "../../editor/ast/NamedElementBuilder";

export interface CustomActionContext extends TemplateContext {
	filepath: string,
	element: NamedElement,
	beforeCursor: string,
	afterCursor: string,
	selection: string,
	input?: string
	output?: string,
	spec?: string,
	similarChunk?: string,
}

export class CustomActionContextBuilder {
	public static async fromDocument(document: vscode.TextDocument): Promise<CustomActionContext> {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			throw new Error("No active text editor");
		}

		// editor context
		const text = document.getText();
		const beforeCursor = text.substring(0, editor.selection.start.character);
		const afterCursor = text.substring(editor.selection.end.character);
		const currentLine = editor.selection.active.line;
		const selection = editor.document.getText(editor.selection);

		// element context
		const elementBuilder = await NamedElementBuilder.from(document);
		const ranges = elementBuilder.getElementForAction(currentLine);
		if (ranges.length === 0) {
			throw new Error("No element found for action");
		}
		const element = ranges[0];
		// TODO: add input, output, spec, similarChunk

		return {
			filepath: document.uri.fsPath,
			element: element,
			beforeCursor: beforeCursor,
			afterCursor: afterCursor,
			selection: selection,
			language: document.languageId
		};
	}
}
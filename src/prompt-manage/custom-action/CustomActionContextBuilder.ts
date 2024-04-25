import vscode from "vscode";
import { NamedElementBuilder } from "../../editor/ast/NamedElementBuilder";
import { StructurerProviderManager } from "../../code-context/StructurerProviderManager";
import { CustomActionTemplateContext } from "./CustomActionTemplateContext";
import { LANGUAGE_BLOCK_COMMENT_MAP, LANGUAGE_LINE_COMMENT_MAP } from "../../editor/language/LanguageCommentMap";

export class CustomActionContextBuilder {
	public static async fromDocument(document: vscode.TextDocument): Promise<CustomActionTemplateContext> {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			throw new Error("No active text editor");
		}

		// editor context
		const filepath = document.uri.fsPath;
		const language = document.languageId;
		const text = document.getText();
		const beforeCursor = text.substring(0, editor.selection.start.character);
		const afterCursor = text.substring(editor.selection.end.character);
		const currentLine = editor.selection.active.line;
		const selection = editor.document.getText(editor.selection);
		const commentSymbol = LANGUAGE_LINE_COMMENT_MAP[language] || "//";

		// element context
		const elementBuilder = await NamedElementBuilder.from(document);
		const ranges = elementBuilder.getElementForAction(currentLine);
		if (ranges.length === 0) {
			throw new Error("No element found for action");
		}
		const element = ranges[0];
		let structurer = StructurerProviderManager.getInstance().getStructurer(language);
		if (!!structurer) {
			// todo: handle input and output
		}

		// todo: add for Spec

		// todo: build for SimilarChunk

		return {
			language: language,
			commentSymbol: commentSymbol,
			filepath: filepath,
			element: element,
			beforeCursor: beforeCursor,
			afterCursor: afterCursor,
			selection: selection,
		};
	}
}
import vscode from "vscode";
import { NamedElementBuilder } from "../../editor/ast/NamedElementBuilder";
import { StructurerProviderManager } from "../../code-context/StructurerProviderManager";
import { CustomActionTemplateContext } from "./CustomActionTemplateContext";
import { LANGUAGE_BLOCK_COMMENT_MAP, LANGUAGE_LINE_COMMENT_MAP } from "../../editor/language/LanguageCommentMap";
import { ToolchainContextManager } from "../../toolchain-context/ToolchainContextManager";
import { CreateToolchainContext } from "../../toolchain-context/ToolchainContextProvider";
import { createNamedElement } from "../../code-context/ast/TreeSitterWrapper";

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
		const elementBuilder = await createNamedElement(document);
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

		// toolchain context
		const creationContext: CreateToolchainContext = {
			action: "CustomAction",
			filename: document.fileName,
			language,
			content: document.getText(),
			element: element
		};

		const contextItems = await ToolchainContextManager.instance().collectContextItems(creationContext);
		let toolchainContext = "";
		if (contextItems.length > 0) {
			toolchainContext = contextItems.map(item => item.text).join("\n - ");
		}

		return {
			language: language,
			commentSymbol: commentSymbol,
			toolchainContext,
			filepath: filepath,
			element: element,
			beforeCursor: beforeCursor,
			afterCursor: afterCursor,
			selection: selection,
		};
	}
}
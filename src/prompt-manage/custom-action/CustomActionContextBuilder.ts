import { AutoDevExtension } from 'src/AutoDevExtension';
import vscode from 'vscode';

import { LANGUAGE_LINE_COMMENT_MAP } from 'base/common/languages/docstring';

import { createNamedElement } from '../../code-context/ast/TreeSitterWrapper';
import { StructurerProviderManager } from '../../code-context/StructurerProviderManager';
import { CreateToolchainContext } from '../../toolchain-context/ToolchainContextProvider';
import { CustomActionTemplateContext } from './CustomActionTemplateContext';

export class CustomActionContextBuilder {
	public static async fromDocument(
		autodev: AutoDevExtension,
		document: vscode.TextDocument,
	): Promise<CustomActionTemplateContext> {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			throw new Error('No active text editor');
		}

		// editor context
		const filepath = document.uri.fsPath;
		const language = document.languageId;
		const text = document.getText();
		const beforeCursor = text.substring(0, editor.selection.start.character);
		const afterCursor = text.substring(editor.selection.end.character);
		const currentLine = editor.selection.active.line;
		const selection = editor.document.getText(editor.selection);
		const commentSymbol = LANGUAGE_LINE_COMMENT_MAP[language] || '//';

		// element context
		const elementBuilder = await createNamedElement(autodev.treeSitterFileManager, document);
		const ranges = elementBuilder.getElementForAction(currentLine);
		if (ranges.length === 0) {
			throw new Error('No element found for action');
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
			action: 'CustomAction',
			filename: document.fileName,
			language,
			content: document.getText(),
			element: element,
		};

		const contextItems = await autodev.toolchainContextManager.collectContextItems(creationContext);
		let toolchainContext = '';
		if (contextItems.length > 0) {
			toolchainContext = contextItems.map(item => item.text).join('\n - ');
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

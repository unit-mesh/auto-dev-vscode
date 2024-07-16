import fs from 'fs';
import path from 'path';
import { ChatViewService } from 'src/editor/views/chat/chatViewService';
import { Range, Selection, TextEditor, Uri, window, workspace } from 'vscode';

import { CHAT_VIEW_ID } from 'base/common/configuration/configuration';

export async function showTutorial(extensionUri: Uri) {
	const tutorialPath = path.join(extensionUri.fsPath, 'autodev_tutorial.py');
	// Ensure keyboard shortcuts match OS
	if (process.platform !== 'darwin') {
		let tutorialContent = fs.readFileSync(tutorialPath, 'utf8');
		tutorialContent = tutorialContent.replace('⌘', '^').replace('Cmd', 'Ctrl');
		fs.writeFileSync(tutorialPath, tutorialContent);
	}

	const doc = await workspace.openTextDocument(Uri.file(tutorialPath));

	await window.showTextDocument(doc, { preview: false });
}

/**
 * `getInput` is a function that retrieves the currently selected text in the active text editor of Visual Studio Code (VSCode). If no text is selected, it retrieves the entire text of the document in the active text editor.
 *
 * @returns {string | undefined} The selected text or the entire text of the document in the active text editor. If no editor is active, it returns `undefined`.
 *
 * @remarks
 * This function uses the `vscode.window.activeTextEditor` property to get the active text editor. If no editor is active, the property is `undefined`, and the function returns `undefined`.
 *
 * If there is a selection in the active text editor, the function uses the `getText` method of the `TextDocument` object associated with the editor to get the selected text. The `selection` property of the `TextEditor` object represents the current selection in the editor.
 *
 * If there is no selection, the function uses the `getText` method of the `TextDocument` object to get the entire text of the document.
 *
 * @example
 * If the active text editor contains the text "Hello, world!" and "world" is selected, the function returns "world". If nothing is selected, the function returns "Hello, world!".
 *
 * @see
 * - {@link https://code.visualstudio.com/api/references/vscode-api#window.activeTextEditor | VSCode API: window.activeTextEditor}
 * - {@link https://code.visualstudio.com/api/references/vscode-api#TextEditor.selection | VSCode API: TextEditor.selection}
 * - {@link https://code.visualstudio.com/api/references/vscode-api#TextDocument.getText | VSCode API: TextDocument.getText}
 */
export function getInput(): [undefined, undefined] | [string, string] {
	const editor = window.activeTextEditor;
	if (!editor) {
		return [undefined, undefined];
	}

	const document = editor.document;
	const languageId = document.languageId;

	let selection: string = document.getText(editor.selection);

	if (selection.length > 0) {
		return [selection, languageId];
	}

	return [document.getText(), languageId];
}

export function getFullScreenTab() {
	const tabs = window.tabGroups.all.flatMap(tabGroup => tabGroup.tabs);
	return tabs.find(tab => (tab.input as any)?.viewType?.endsWith(CHAT_VIEW_ID));
}

export async function addHighlightedCodeToContext(editor: TextEditor, selection: Selection, chat: ChatViewService) {
	const range = new Range(selection.start, selection.end);
	const contents = editor.document.getText(range);

	const rangeInFileWithContents = {
		filepath: editor.document.uri.fsPath,
		contents,
		range: {
			start: {
				line: selection.start.line,
				character: selection.start.character,
			},
			end: {
				line: selection.end.line,
				character: selection.end.character,
			},
		},
	};

	await chat.request('highlightedCode', {
		rangeInFileWithContents,
	});
}

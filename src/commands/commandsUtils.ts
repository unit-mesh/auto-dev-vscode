import path from "path";
import { getExtensionUri } from "../context";
import fs from "fs";
import vscode from "vscode";
import { AutoDevWebviewProtocol } from "../editor/webview/AutoDevWebviewProtocol";

export async function showTutorial() {
	const tutorialPath = path.join(getExtensionUri().fsPath, "autodev_tutorial.py");
	// Ensure keyboard shortcuts match OS
	if (process.platform !== "darwin") {
		let tutorialContent = fs.readFileSync(tutorialPath, "utf8");
		tutorialContent = tutorialContent.replace("⌘", "^").replace("Cmd", "Ctrl");
		fs.writeFileSync(tutorialPath, tutorialContent);
	}

	const doc = await vscode.workspace.openTextDocument(
		vscode.Uri.file(tutorialPath),
	);
	await vscode.window.showTextDocument(doc, { preview: false });
}

export async function addHighlightedCodeToContext(edit: boolean, webviewProtocol: AutoDevWebviewProtocol | undefined,) {
	const editor = vscode.window.activeTextEditor;
	if (editor) {
		const selection = editor.selection;
		if (selection.isEmpty) {
			return;
		}
		const range = new vscode.Range(selection.start, selection.end);
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

		webviewProtocol?.request("highlightedCode", {
			rangeInFileWithContents,
		});
	}
}

export function getFullScreenTab() {
	const tabs = vscode.window.tabGroups.all.flatMap((tabGroup) => tabGroup.tabs);
	return tabs.find(
		(tab) => (tab.input as any)?.viewType?.endsWith("continue.continueGUIView"),
	);
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
export function getInput() {
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		return undefined;
	}
	let selection: string = editor.document.getText(editor.selection);

	let document = editor.document;
	let input;

	if (selection.length > 0) {
		input = selection;
	} else {
		input = document.getText();
	}

	return input;
}
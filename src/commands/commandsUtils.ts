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
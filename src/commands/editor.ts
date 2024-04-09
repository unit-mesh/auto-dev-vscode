import vscode from "vscode";

export function selectCodeInRange(start: vscode.Position, end: vscode.Position) {
	const editor = vscode.window.activeTextEditor;
	if (editor) {
		const newSelection = new vscode.Selection(start, end);
		editor.selection = newSelection;
		editor.revealRange(newSelection);
	}
}

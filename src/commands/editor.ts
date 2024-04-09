import vscode, { Position } from "vscode";

export function selectCodeInRange(start: vscode.Position, end: vscode.Position) {
	const editor = vscode.window.activeTextEditor;
	if (editor) {
		const newSelection = new vscode.Selection(start, end);
		editor.selection = newSelection;
		editor.revealRange(newSelection);
	}
}

export function insertCodeByRange(textRange: Position, doc: string) {
	// edit.insert(document.uri, range.blockRange.start, doc);
	const editor = vscode.window.activeTextEditor;
	if (editor) {
		editor.edit((editBuilder) => {
			editBuilder.insert(textRange, doc);
		});
	}
}


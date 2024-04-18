import { window } from 'vscode';

export async function showQuickPick() {
	let i = 0;
	const result = await window.showQuickPick(['Explain code'], {
		placeHolder: 'Select the AI Commands',
		onDidSelectItem: item => window.showInformationMessage(`Focus ${++i}: ${item}`)
	});

	window.showInformationMessage(`Got: ${result}`);
}

export async function showInputBox() {
	const result = await window.showInputBox({
		value: 'GenDoc',
		valueSelection: [2, 4],
		placeHolder: 'Select or use / to select commands',
	});
	window.showInformationMessage(`Got: ${result}`);
}
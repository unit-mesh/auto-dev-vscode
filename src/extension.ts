import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "auto-dev-vscode" is now active!');

	let disposable = vscode.commands.registerCommand('auto-dev-vscode.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from auto-dev-vscode!');
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}

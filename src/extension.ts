import * as vscode from 'vscode';

const channel = vscode.window.createOutputChannel("AUTO-DEV-VSCODE")
export function activate(context: vscode.ExtensionContext) {
	// channel.show();
	// channel.appendLine(JSON.stringify(vscode.languages.getLanguages()))
	vscode.languages.getLanguages().then((v) => {
		console.log("its", v)
	}, (r) => console.log(r))

	console.log('Congratulations, your extension "auto-dev-vscode" is now active!');

	let disposable = vscode.commands.registerCommand('auto-dev-vscode.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from auto-dev-vscode!');
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}

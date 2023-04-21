import * as vscode from 'vscode';

import {install} from "./codelens";

const channel = vscode.window.createOutputChannel("AUTO-DEV-VSCODE")
export function activate(context: vscode.ExtensionContext) {
	channel.show();
	console.log('Congratulations, your extension "auto-dev-vscode" is now active!');

	let disposable = vscode.commands.registerCommand('auto-dev-vscode.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from auto-dev-vscode!');
	});
	context.subscriptions.push(disposable);

	install(context);
}

export function deactivate() {}

import * as vscode from "vscode";

export class AutoDevCodeActionProvider implements vscode.CodeActionProvider {
	provideCodeActions(
		document: vscode.TextDocument,
		range: vscode.Range | vscode.Selection,
		context: vscode.CodeActionContext,
		token: vscode.CancellationToken
	): vscode.ProviderResult<(vscode.CodeAction | vscode.Command)[]> {
		throw new Error("Method not implemented.");
	}

	resolveCodeAction?(
		codeAction: vscode.CodeAction,
		token: vscode.CancellationToken
	): vscode.ProviderResult<vscode.CodeAction> {
		throw new Error("Method not implemented.");
	}
}

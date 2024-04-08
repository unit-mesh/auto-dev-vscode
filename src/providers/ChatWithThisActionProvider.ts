import * as vscode from "vscode";

export class ChatWithThisActionProvider extends vscode.CodeAction {
  static providedCodeActionKinds  = [
    vscode.CodeActionKind.Refactor
  ]
  
  provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range | vscode.Selection,
    context: vscode.CodeActionContext,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.CodeAction[]> {
    const langId = document.languageId;

    const codeAction = new vscode.CodeAction(
      "Chat With this (AutoDev)",
      vscode.CodeActionKind.Empty
    );

    codeAction.edit = new vscode.WorkspaceEdit();
    return [codeAction];
  }
}

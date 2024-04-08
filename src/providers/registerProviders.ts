import * as vscode from "vscode";
import { AutoDevQuickFixProvider } from "./AutoDevQuickFixProvider";
import { AutoDocumentationCodeActionProvider } from "./AutoDevCodeActionProvider";

export function registerQuickFixProvider() {
  // In your extension's activate function:
  vscode.languages.registerCodeActionsProvider(
    { language: "*" },
    new AutoDevQuickFixProvider(),
    {
      providedCodeActionKinds: AutoDevQuickFixProvider.providedCodeActionKinds,
    }
  );

  // Normal action
  vscode.languages.registerCodeActionsProvider(
    { language: "*" },
    new AutoDocumentationCodeActionProvider(),
    {
      providedCodeActionKinds: [vscode.CodeActionKind.Empty],
    }
  );
}



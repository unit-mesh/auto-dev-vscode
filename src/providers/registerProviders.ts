import * as vscode from "vscode";
import { AutoDevQuickFixProvider } from "./AutoDevQuickFixProvider";
import { AutoDocumentationActionProvider } from "./AutoDocumentationActionProvider";

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
    new AutoDocumentationActionProvider(),
    {
      providedCodeActionKinds: [vscode.CodeActionKind.Empty],
    }
  );
}



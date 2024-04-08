import * as vscode from "vscode";
import { AutoDevQuickFixProvider } from "./AutoDevQuickFixProvider";
import { AutoDevCodeActionProvider } from "./AutoDevCodeActionProvider";

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
    new AutoDevCodeActionProvider(),
    {
      providedCodeActionKinds: [vscode.CodeActionKind.Empty],
    }
  );
}



import * as vscode from "vscode";
import { AutoDevQuickFixProvider } from "./AutoDevQuickFixProvider";
import { AutoDocumentationActionProvider } from "./AutoDocumentationActionProvider";
import { SUPPORTED_LANGID } from "../supported";
import { ChatWithThisActionProvider } from "./ChatWithThisActionProvider";

export function registerQuickFixProvider() {
  vscode.languages.registerCodeActionsProvider(
    { language: "*" },
    new AutoDevQuickFixProvider(),
    {
      providedCodeActionKinds: AutoDevQuickFixProvider.providedCodeActionKinds,
    }
  );

  SUPPORTED_LANGID.forEach((langId) => {
    vscode.languages.registerCodeActionsProvider(
      { language: langId },
      new AutoDocumentationActionProvider(),
      {
        providedCodeActionKinds: AutoDocumentationActionProvider.providedCodeActionKinds,
      }
    );

    vscode.languages.registerCodeActionsProvider(
      { language: langId },
      new ChatWithThisActionProvider("Chat with This"),
      {
        providedCodeActionKinds: ChatWithThisActionProvider.providedCodeActionKinds,
      }
    );
  });
}

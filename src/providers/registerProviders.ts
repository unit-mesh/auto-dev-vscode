import * as vscode from "vscode";
import { AutoDevQuickFixProvider } from "./AutoDevQuickFixProvider";
import { AutoDocumentationActionProvider } from "./AutoDocumentationActionProvider";
import { SUPPORTED_LANGUAGES } from "../language/supported";
import { commands } from "vscode";
import { CodeActionParams } from "vscode-languageclient";

export function registerActionProvider(context: vscode.ExtensionContext) {
  vscode.languages.registerCodeActionsProvider(
    { language: "*" },
    new AutoDevQuickFixProvider(),
    {
      providedCodeActionKinds: AutoDevQuickFixProvider.providedCodeActionKinds,
    }
  );

  SUPPORTED_LANGUAGES.forEach((langId) => {
    vscode.languages.registerCodeActionsProvider(
      { language: langId },
      new AutoDocumentationActionProvider(),
      {
        providedCodeActionKinds:
          AutoDocumentationActionProvider.providedCodeActionKinds,
      }
    );

    // vscode.languages.registerCodeActionsProvider(
    //   { language: langId },
    //   new ChatWithThisActionProvider("Chat with This"),
    //   {
    //     providedCodeActionKinds: ChatWithThisActionProvider.providedCodeActionKinds,
    //   }
    // );

    // // Register command with AST tree when open file
    // context.subscriptions.push(commands.registerCommand("Chat with this", async (params: CodeActionParams) => {
    // 	// if it's a code methods?
    // 	console.log(params);
    // }));
  });
}

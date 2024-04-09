import * as vscode from "vscode";
import { AutoDevContext } from "../autodev-context";
import { SUPPORTED_LANGUAGES } from "../language/supported";
import { AutoDevActionProvider } from "./AutoDevActionProvider";

export function registerAutoDevProviders(context: AutoDevContext) {
  SUPPORTED_LANGUAGES.forEach((langId) => {
    vscode.languages.registerCodeActionsProvider(
      { language: langId },
      new AutoDevActionProvider(context),
      {
        providedCodeActionKinds:
        AutoDevActionProvider.providedCodeActionKinds,
      }
    );
  });
}

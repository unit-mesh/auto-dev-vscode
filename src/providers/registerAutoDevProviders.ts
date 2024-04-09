import * as vscode from "vscode";
import { AutoDevContext } from "../autodev-context";
import { SUPPORTED_LANGUAGES } from "../language/supported";
import { AutoDevActionProvider } from "./AutoDevActionProvider";

export function registerAutoDevProviders(context: AutoDevContext) {
	SUPPORTED_LANGUAGES.forEach((language) => {
		vscode.languages.registerCodeActionsProvider({ language },
			new AutoDevActionProvider(context),
			{
				providedCodeActionKinds:
				AutoDevActionProvider.providedCodeActionKinds,
			}
		);
	});
}

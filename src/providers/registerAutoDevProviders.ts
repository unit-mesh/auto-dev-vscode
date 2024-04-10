import * as vscode from "vscode";
import { AutoDevExtension } from "../auto-dev-extension";
import { SUPPORTED_LANGUAGES } from "../language/supported";
import { AutoDevActionProvider } from "./AutoDevActionProvider";

export function registerAutoDevProviders(context: AutoDevExtension) {
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

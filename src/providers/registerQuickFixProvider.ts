import * as vscode from "vscode";
import { AutoDevQuickFixProvider } from "./AutoDevQuickFixProvider";
import { AutoDevExtension } from "../auto-dev-extension";
import { SUPPORTED_LANGUAGES } from "../language/supported";

export function registerQuickFixProvider(context: AutoDevExtension) {
	SUPPORTED_LANGUAGES.forEach((language) => {
		vscode.languages.registerCodeActionsProvider({ language },
			new AutoDevQuickFixProvider(),
			{
				providedCodeActionKinds: AutoDevQuickFixProvider.providedCodeActionKinds,
			}
		);
	});
}

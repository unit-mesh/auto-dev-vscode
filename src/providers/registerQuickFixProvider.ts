import * as vscode from "vscode";
import { AutoDevQuickFixProvider } from "./AutoDevQuickFixProvider";
import { AutoDevContext } from "../autodev-context";
import { SUPPORTED_LANGUAGES } from "../language/supported";

export function registerQuickFixProvider(context: AutoDevContext) {
	SUPPORTED_LANGUAGES.forEach((language) => {
		vscode.languages.registerCodeActionsProvider({ language },
			new AutoDevQuickFixProvider(),
			{
				providedCodeActionKinds: AutoDevQuickFixProvider.providedCodeActionKinds,
			}
		);
	});
}

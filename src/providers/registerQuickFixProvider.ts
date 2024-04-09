import * as vscode from "vscode";
import { AutoDevQuickFixProvider } from "./AutoDevQuickFixProvider";
import { AutoDevContext } from "../autodev-context";

export function registerQuickFixProvider(context: AutoDevContext) {
	vscode.languages.registerCodeActionsProvider(
		{ language: "*" },
		new AutoDevQuickFixProvider(),
		{
			providedCodeActionKinds: AutoDevQuickFixProvider.providedCodeActionKinds,
		}
	);
}

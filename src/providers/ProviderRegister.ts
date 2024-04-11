import { AutoDevExtension } from "../AutoDevExtension.ts";
import { SUPPORTED_LANGUAGES } from "../language/SupportedLanguage.ts";
import vscode from "vscode";
import { AutoDevCodeLensProvider } from "./AutoDevCodeLensProvider.ts";
import { AutoDevActionProvider } from "./AutoDevActionProvider.ts";
import { AutoDevQuickFixProvider } from "./AutoDevQuickFixProvider.ts";

export function registerCodeLensProviders(context: AutoDevExtension) {
	const filter = SUPPORTED_LANGUAGES.map(it => ({ language: it } as vscode.DocumentFilter));
	const codelensProviderSub = vscode.languages.registerCodeLensProvider(
		filter,
		new AutoDevCodeLensProvider(context),
	);

	context.extensionContext.subscriptions.push(codelensProviderSub);
}

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
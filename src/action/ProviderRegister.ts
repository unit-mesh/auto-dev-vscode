import vscode from "vscode";

import { AutoDevExtension } from "../AutoDevExtension";
import { SUPPORTED_LANGUAGES } from "../editor/language/SupportedLanguage";
import { AutoDevCodeLensProvider } from "./providers/AutoDevCodeLensProvider";
import { AutoDevCodeActionProvider } from "./providers/AutoDevCodeActionProvider";
import { AutoDevCodeSuggestionProvider } from './providers/AutoDevCodeSuggestionProvider';
import { AutoDevQuickFixProvider } from "./providers/AutoDevQuickFixProvider";
import { channel } from "../channel";
import { AutoDevRenameProvider } from "./refactor/rename/AutoDevRenameProvider";

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
			new AutoDevCodeActionProvider(context),
			{
				providedCodeActionKinds:
				AutoDevCodeActionProvider.providedCodeActionKinds,
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

export function registerWebViewProvider(extension: AutoDevExtension) {
	extension.extensionContext.subscriptions.push(vscode.window.registerWebviewViewProvider("autodev.autodevGUIView",
			extension.sidebar, { webviewOptions: { retainContextWhenHidden: true }, }
		)
	);
}

export function registerRenameAction(extension: AutoDevExtension) {
	channel.appendLine("rename action enabled");
	extension.extensionContext.subscriptions.push(vscode.languages.registerRenameProvider(SUPPORTED_LANGUAGES,
			new AutoDevRenameProvider()
		)
	);
}

export function registerCodeSuggestionProvider(extension: AutoDevExtension) {
	extension.extensionContext.subscriptions.push(vscode.languages.registerInlineCompletionItemProvider(SUPPORTED_LANGUAGES,
			new AutoDevCodeSuggestionProvider()
		)
	);
}

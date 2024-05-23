import { AutoDevExtension } from "../AutoDevExtension";
import { SUPPORTED_LANGUAGES } from "../editor/language/SupportedLanguage";
import vscode, { Position, Range } from "vscode";
import { AutoDevCodeLensProvider } from "./providers/AutoDevCodeLensProvider";
import { AutoDevCodeActionProvider } from "./providers/AutoDevCodeActionProvider";
import { RenameLookupExecutor } from "./refactor/RenameLookupExecutor";
import { AutoDevQuickFixProvider } from "./providers/AutoDevQuickFixProvider";
import { SettingService } from "../settings/SettingService";
import { channel } from "../channel";

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

	let disposable = vscode.languages.registerRenameProvider(SUPPORTED_LANGUAGES, {
		async prepareRename(document, position, token):
			Promise<undefined | Range | { range: Range; placeholder: string; }> {
			let range = document.getWordRangeAtPosition(position);
			if (!range) {
				return undefined;
			}

			if (!SettingService.instance().isEnableRename()) {
				return range;
			}

			return await RenameLookupExecutor.suggest(document, position, token);
		},

		provideRenameEdits(document, position: Position, newName: string, token) {
			let range = document.getWordRangeAtPosition(position);
			if (!range) {
				return;
			}

			let edit = new vscode.WorkspaceEdit();
			edit.replace(document.uri, range, newName);
			return edit;
		}
	});

	extension.extensionContext.subscriptions.push(disposable);
}

import { AutoDevExtension } from "../../AutoDevExtension";
import { SUPPORTED_LANGUAGES } from "../language/SupportedLanguage";
import vscode, { Position, Range } from "vscode";
import { AutoDevCodeLensProvider } from "./AutoDevCodeLensProvider";
import { AutoDevCodeActionProvider } from "./AutoDevCodeActionProvider";
import { RenameLookup } from "../action/refactor/RenameLookup";
import { AutoDevQuickFixProvider } from "./AutoDevQuickFixProvider";
import { SettingService } from "../../settings/SettingService";

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
	vscode.languages.registerRenameProvider(SUPPORTED_LANGUAGES, {
		async prepareRename(document, position, token): Promise<undefined | Range | {
			range: Range;
			placeholder: string;
		}> {
			let range = document.getWordRangeAtPosition(position);
			if (!range) {
				return undefined;
			}

			if (!SettingService.instance().isEnableRename()) {
				return range;
			}

			return await RenameLookup.suggest(document, position, token);
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
}

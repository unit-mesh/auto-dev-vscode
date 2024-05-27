import vscode, { Disposable } from "vscode";

import { AutoDevExtension } from "../AutoDevExtension";
import { SUPPORTED_LANGUAGES } from "../editor/language/SupportedLanguage";
import { AutoDevCodeLensProvider } from "./providers/AutoDevCodeLensProvider";
import { AutoDevCodeActionProvider } from "./providers/AutoDevCodeActionProvider";
import { AutoDevCodeSuggestionProvider } from './providers/AutoDevCodeSuggestionProvider';
import { AutoDevQuickFixProvider } from "./providers/AutoDevQuickFixProvider";
import { AutoDevRenameProvider } from "./refactor/rename/AutoDevRenameProvider";
import { SettingService } from "../settings/SettingService";

export function registerCodeLensProviders(context: AutoDevExtension) {
	let disposables: Disposable[] = SUPPORTED_LANGUAGES.map((language) => {
		return vscode.languages.registerCodeLensProvider({ language },
			new AutoDevCodeLensProvider(context),
		);
	});

	context.extensionContext.subscriptions.push(...disposables);
}

export function registerAutoDevProviders(context: AutoDevExtension) {
	let disposables = SUPPORTED_LANGUAGES.map((language) => {
		return vscode.languages.registerCodeActionsProvider({ language },
			new AutoDevCodeActionProvider(context),
			{
				providedCodeActionKinds:
				AutoDevCodeActionProvider.providedCodeActionKinds,
			}
		);
	});

	context.extensionContext.subscriptions.push(...disposables);
}

export function registerQuickFixProvider(context: AutoDevExtension) {
	let disposables = SUPPORTED_LANGUAGES.map((language) => {
		return vscode.languages.registerCodeActionsProvider({ language },
			new AutoDevQuickFixProvider(),
			{
				providedCodeActionKinds: AutoDevQuickFixProvider.providedCodeActionKinds,
			}
		);
	});

	context.extensionContext.subscriptions.push(...disposables);
}

export function registerWebViewProvider(extension: AutoDevExtension) {
	let disposable = vscode.window.registerWebviewViewProvider("autodev.autodevGUIView",
		extension.sidebar, { webviewOptions: { retainContextWhenHidden: true }, }
	);

	extension.extensionContext.subscriptions.push(disposable);
}

export function registerCodeSuggestionProvider(extension: AutoDevExtension) {
	let disposable = vscode.languages.registerInlineCompletionItemProvider(SUPPORTED_LANGUAGES,
		new AutoDevCodeSuggestionProvider()
	);

	extension.extensionContext.subscriptions.push(disposable);
}

export function registerRenameAction(extension: AutoDevExtension) {
	let disposable = vscode.languages.registerRenameProvider(SUPPORTED_LANGUAGES, new AutoDevRenameProvider());
	extension.extensionContext.subscriptions.push(disposable);
}

export function registerRefactoringRename(extension: AutoDevExtension) {
	if (SettingService.instance().isEnableRename()) {
		registerRenameAction(extension);
	}

	vscode.workspace.onDidChangeConfiguration(() => {
		if (SettingService.instance().isEnableRename()) {
			// 如果启用了重命名功能，则注册重命名动作（待优化）
			registerRenameAction(extension);
		} else {
			// 否则不做任何操作
		}
	});
}

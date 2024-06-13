import { Disposable, languages } from 'vscode';

import { SUPPORTED_LANGUAGES } from 'base/common/languages/languages';

import { type AutoDevExtension } from '../AutoDevExtension';
import { AutoDevCodeActionProvider } from './providers/AutoDevCodeActionProvider';
import { AutoDevCodeLensProvider } from './providers/AutoDevCodeLensProvider';
import { AutoDevCodeSuggestionProvider } from './providers/AutoDevCodeSuggestionProvider';
import { AutoDevQuickFixProvider } from './providers/AutoDevQuickFixProvider';
import { AutoDevRenameProvider } from './refactor/rename/AutoDevRenameProvider';

export function registerCodeLensProvider(autodev: AutoDevExtension) {
	const codelensProvider = new AutoDevCodeLensProvider(autodev);

	return Disposable.from(codelensProvider, languages.registerCodeLensProvider(SUPPORTED_LANGUAGES, codelensProvider));
}

export function registerAutoDevProviders(context: AutoDevExtension) {
	return languages.registerCodeActionsProvider(SUPPORTED_LANGUAGES, new AutoDevCodeActionProvider(context), {
		providedCodeActionKinds: AutoDevCodeActionProvider.providedCodeActionKinds,
	});
}

export function registerQuickFixProvider(context: AutoDevExtension) {
	return languages.registerCodeActionsProvider(SUPPORTED_LANGUAGES, new AutoDevQuickFixProvider(context), {
		providedCodeActionKinds: AutoDevQuickFixProvider.providedCodeActionKinds,
	});
}

export function registerCodeSuggestionProvider(extension: AutoDevExtension) {
	return languages.registerInlineCompletionItemProvider(
		SUPPORTED_LANGUAGES,
		new AutoDevCodeSuggestionProvider(extension),
	);
}

export function registerRenameAction(extension: AutoDevExtension) {
	return languages.registerRenameProvider(SUPPORTED_LANGUAGES, new AutoDevRenameProvider(extension));
}

export function registerRefactoringRename(extension: AutoDevExtension) {
	// if (SettingService.instance().isEnableRename()) {
	// 	registerRenameAction(extension);
	// }
	// workspace.onDidChangeConfiguration(() => {
	// 	if (SettingService.instance().isEnableRename()) {
	// 		// 如果启用了重命名功能，则注册重命名动作（待优化）
	// 		registerRenameAction(extension);
	// 	} else {
	// 		// 否则不做任何操作
	// 	}
	// });
}

import { Disposable, languages } from 'vscode';

import { SUPPORTED_LANGUAGES } from 'base/common/languages/languages';

import { type AutoDevExtension } from '../AutoDevExtension';
import { AutoDevCodeActionProvider } from './providers/AutoDevCodeActionProvider';
import { AutoDevCodeLensProvider } from './providers/AutoDevCodeLensProvider';
import { AutoDevCodeInlineCompletionProvider } from './providers/AutoDevCodeInlineCompletionProvider';
import { AutoDevQuickFixProvider } from './providers/AutoDevQuickFixProvider';
import { AutoDevRenameProvider } from './refactor/rename/AutoDevRenameProvider';

export function registerCodeLensProvider(context: AutoDevExtension) {
	const codelensProvider = new AutoDevCodeLensProvider(context);

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
		new AutoDevCodeInlineCompletionProvider(extension),
	);
}

export function registerRenameAction(extension: AutoDevExtension) {
	return languages.registerRenameProvider(SUPPORTED_LANGUAGES, new AutoDevRenameProvider(extension));
}

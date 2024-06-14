import vscode from 'vscode';

import { EmbeddingsProvider } from './_base/EmbeddingsProvider';
import { LocalEmbeddingsProvider } from './LocalEmbeddingsProvider';

/**
 * @deprecated Please use {@link LanguageModelsService} instead.
 */
export namespace EmbeddingsProviderManager {
	export function init(context: vscode.ExtensionContext) {
		LocalEmbeddingsProvider.getInstance().init(context.extensionPath);
	}

	export function create(): EmbeddingsProvider {
		// todo: add more provider by settings
		return LocalEmbeddingsProvider.getInstance();
	}
}

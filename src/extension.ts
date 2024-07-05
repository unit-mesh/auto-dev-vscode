// for Dependency Injection with InversifyJS
import 'reflect-metadata';
import { type ExtensionContext, l10n } from 'vscode';

import { ConfigurationService } from 'base/common/configuration/configurationService';
import { IExtensionContext, IExtensionUri } from 'base/common/configuration/context';
import { ContextStateService } from 'base/common/configuration/contextState';
import { WorkspaceFileSystem } from 'base/common/fs';
import { InstantiationService } from 'base/common/instantiation/instantiationService';
import { ILanguageServiceProvider, LanguageServiceProvider } from 'base/common/languages/languageService';
import { log, logger } from 'base/common/log/log';

import { AutoDevExtension } from './AutoDevExtension';
import { LanguageModelsService } from './base/common/language-models/languageModelsService';
import { CommandsService } from './commands/commandsService';
import { ChatViewService } from './editor/views/chat/chatViewService';

(globalThis as any).self = globalThis;

export async function activate(context: ExtensionContext) {
	const instantiationService = new InstantiationService();

	// Injection the extension context into to global
	instantiationService.registerInstance(IExtensionContext, context);
	instantiationService.registerInstance(IExtensionUri, context.extensionUri);

	instantiationService.registerSingleton(WorkspaceFileSystem);

	context.subscriptions.push(
		instantiationService.registerSingleton(ConfigurationService),
		instantiationService.registerSingleton(ContextStateService),
		instantiationService.registerSingleton(LanguageModelsService),
		instantiationService.registerSingleton(ILanguageServiceProvider, LanguageServiceProvider),
		instantiationService.registerSingleton(ChatViewService).register(),
		instantiationService.registerSingleton(AutoDevExtension).register(),
		instantiationService.registerSingleton(CommandsService).register(),
	);

	instantiationService.get(AutoDevExtension).run();

	logger.info(l10n.t('Welcome to AutoDev, 🧙 the AI-powered coding wizard.'));

	// @ts-expect-error - This is a hack code that only works with vite.
	if (import.meta.env.MODE === 'development') {
		logger.show(true);
	}
}

export function deactivate() {}

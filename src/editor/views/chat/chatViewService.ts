import { inject, injectable } from 'inversify';
import { commands, type ExtensionContext, window } from 'vscode';

import { CHAT_VIEW_ID } from 'base/common/configuration/configuration';
import { ConfigurationService } from 'base/common/configuration/configurationService';
import { IExtensionContext } from 'base/common/configuration/context';
import { LanguageModelsService } from 'base/common/language-models/languageModelsService';

import { ContinueViewProvider } from './continue/continueViewProvider';

@injectable()
export class ChatViewService {
	private continueViewProvider: ContinueViewProvider;

	constructor(
		@inject(IExtensionContext)
		context: ExtensionContext,

		@inject(ConfigurationService)
		configService: ConfigurationService,

		@inject(LanguageModelsService)
		lm: LanguageModelsService,
	) {
		this.continueViewProvider = new ContinueViewProvider(context, configService, lm);
	}

	send(type: string, message?: unknown) {
		return this.continueViewProvider.send(type, message);
	}

	postMessage(message: unknown) {
		return this.continueViewProvider.postMessage(message);
	}

	newSession(prompt?: string) {
		return this.continueViewProvider.newSession(prompt);
	}

	input(value: string) {
		return this.continueViewProvider.input(value);
	}

	show() {
		return commands.executeCommand(`${CHAT_VIEW_ID}.focus`);
	}

	register() {
		return window.registerWebviewViewProvider(CHAT_VIEW_ID, this.continueViewProvider, {
			webviewOptions: {
				retainContextWhenHidden: true,
			},
		});
	}
}

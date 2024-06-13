import { LanguageIdentifier } from 'base/common/languages/languages';
import { ILanguageServiceProvider } from 'base/common/languages/languageService';

import { providerContainer } from '../ProviderContainer.config';
import { ITestGenProvider } from '../ProviderTypes';

export class TestGenProviderManager {
	constructor(private langService: ILanguageServiceProvider) {}

	async provide(lang: LanguageIdentifier) {
		let testProviders = providerContainer.getAll(ITestGenProvider);
		let provider = testProviders.find(provider => {
			return provider.isApplicable(lang);
		});

		if (!provider) {
			return undefined;
		}

		await provider.setupLanguage(this.langService);

		return provider;
	}
}

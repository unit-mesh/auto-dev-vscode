import { TestGenProvider } from "./_base/test/TestGenProvider";
import { SupportedLanguage } from "../editor/language/SupportedLanguage";
import { providerContainer } from "../ProviderContainer.config";
import { PROVIDER_TYPES } from "../ProviderTypes";
import { DefaultLanguageService } from "../editor/language/service/DefaultLanguageService";

export class TestGenProviderManager {
	private static instance: TestGenProviderManager;

	private constructor() {
	}

	static getInstance(): TestGenProviderManager {
		if (!TestGenProviderManager.instance) {
			TestGenProviderManager.instance = new TestGenProviderManager();
		}
		return TestGenProviderManager.instance;
	}

	async async(lang: SupportedLanguage): Promise<TestGenProvider | undefined> {
		let testProviders = providerContainer.getAll<TestGenProvider>(PROVIDER_TYPES.TestGenProvider);
		let provider = testProviders.find((provider) => {
			return provider.isApplicable(lang);
		});

		if (!provider) {
			return undefined;
		}

		let langService = new DefaultLanguageService();
		await provider.setup(langService);

		return provider;
	}
}
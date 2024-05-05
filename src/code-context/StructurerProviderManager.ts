import { SupportedLanguage } from "../editor/language/SupportedLanguage";
import { StructurerProvider } from "./_base/BaseStructurer";
import { providerContainer } from "../ProviderContainer.config";
import { PROVIDER_TYPES } from "../ProviderTypes";

export class StructurerProviderManager {
	private static instance: StructurerProviderManager;

	private constructor() {
	}

	static getInstance(): StructurerProviderManager {
		if (!StructurerProviderManager.instance) {
			StructurerProviderManager.instance = new StructurerProviderManager();
		}
		return StructurerProviderManager.instance;
	}

	getStructurer(lang: SupportedLanguage): StructurerProvider | undefined {
		let testProviders = providerContainer.getAll<StructurerProvider>(PROVIDER_TYPES.StructurerProvider);
		let provider = testProviders.find((provider) => {
			return provider.isApplicable(lang);
		});

		if (!provider) {
			return undefined;
		}

		return provider;
	}
}

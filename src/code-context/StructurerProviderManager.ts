import { SupportedLanguage } from "../editor/language/SupportedLanguage";
import { Structurer } from "./_base/BaseStructurer";
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

	getStructurer(lang: SupportedLanguage): Structurer | undefined {
		let testProviders = providerContainer.getAll<Structurer>(PROVIDER_TYPES.Structurer);
		let provider = testProviders.find((provider) => {
			return provider.isApplicable(lang);
		});

		if (!provider) {
			return undefined;
		}

		return provider;
	}
}

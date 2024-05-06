import { SupportedLanguage } from "../editor/language/SupportedLanguage";
import { RelatedCodeProvider } from "./_base/RelatedCodeProvider";
import { providerContainer } from "../ProviderContainer.config";
import { PROVIDER_TYPES } from "../ProviderTypes";
import { TSLanguageService } from "../editor/language/service/TSLanguageService";

export class RelatedCodeProviderManager {
	private static instance: RelatedCodeProviderManager;

	static getInstance(): RelatedCodeProviderManager {
		if (!RelatedCodeProviderManager.instance) {
			RelatedCodeProviderManager.instance = new RelatedCodeProviderManager();
		}
		return RelatedCodeProviderManager.instance;
	}

	private relatedMap: Map<SupportedLanguage, RelatedCodeProvider> = new Map();

	constructor() {
		this.relatedMap = new Map();
		providerContainer.getAll<RelatedCodeProvider>(PROVIDER_TYPES.RelatedCodeProvider).forEach((provider) => {
			this.relatedMap.set(provider.language, provider);
		});
	}

	provider(lang: SupportedLanguage, langService: TSLanguageService): RelatedCodeProvider | undefined {
		let relatedProvider = this.relatedMap.get(lang);
		if (relatedProvider) {
			relatedProvider.setupLanguage(langService);
		}

		return relatedProvider;
	}
}
import { SupportedLanguage } from "../editor/language/SupportedLanguage";
import { RelevantCodeProvider } from "./_base/RelevantCodeProvider";
import { providerContainer } from "../ProviderContainer.config";
import { PROVIDER_TYPES } from "../ProviderTypes";
import { TSLanguageService } from "../editor/language/service/TSLanguageService";

export class RelevantCodeProviderManager {
	private static instance: RelevantCodeProviderManager;

	static getInstance(): RelevantCodeProviderManager {
		if (!RelevantCodeProviderManager.instance) {
			RelevantCodeProviderManager.instance = new RelevantCodeProviderManager();
		}
		return RelevantCodeProviderManager.instance;
	}

	private relatedMap: Map<SupportedLanguage, RelevantCodeProvider> = new Map();

	constructor() {
		this.relatedMap = new Map();
		providerContainer.getAll<RelevantCodeProvider>(PROVIDER_TYPES.RelevantCodeProvider).forEach((provider) => {
			this.relatedMap.set(provider.language, provider);
		});
	}

	provider(lang: SupportedLanguage, langService: TSLanguageService): RelevantCodeProvider | undefined {
		let relatedProvider = this.relatedMap.get(lang);
		if (relatedProvider) {
			relatedProvider.setupLanguage(langService);
		}

		return relatedProvider;
	}
}
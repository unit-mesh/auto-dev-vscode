import { SupportedLanguage } from "../editor/language/SupportedLanguage";
import { RelatedCodeProvider } from "./_base/RelatedCodeProvider";
import { CodeFileCacheManager } from "../editor/cache/CodeFileCacheManager";
import { providerContainer } from "../ProviderContainer.config";
import { PROVIDER_TYPES } from "../ProviderTypes";

export class RelatedCodeProviderManager {
	private relatedMap: Map<SupportedLanguage, RelatedCodeProvider> = new Map();

	constructor(fileCacheManager: CodeFileCacheManager) {
		this.relatedMap = new Map();
		// this.relatedMap.set("java", new JavaRelatedProvider(fileCacheManager));
		providerContainer.getAll<RelatedCodeProvider>(PROVIDER_TYPES.RelatedCodeProvider).forEach((provider) => {
			this.relatedMap.set(provider.language, provider);
		});
	}

	getRelatedProvider(lang: SupportedLanguage): RelatedCodeProvider | undefined {
		return this.relatedMap.get(lang);
	}
}
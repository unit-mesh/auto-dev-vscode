import { SupportedLanguage } from "../../language/SupportedLanguage";
import { RelatedProvider } from "./RelatedProvider";
import { JavaRelatedProvider } from "./JavaRelatedProvider";
import { CodeFileCacheManager } from "../../cache/CodeFileCacheManager";

export class RelatedProviderManager {
	private relatedMap: Map<SupportedLanguage, RelatedProvider> = new Map();

	constructor(fileCacheManager: CodeFileCacheManager) {
		this.relatedMap = new Map();
		this.relatedMap.set("java", new JavaRelatedProvider(fileCacheManager));
	}

	getRelatedProvider(lang: SupportedLanguage): RelatedProvider | undefined {
		return this.relatedMap.get(lang);
	}
}
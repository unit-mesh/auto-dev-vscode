import { SupportedLanguage } from "../language/SupportedLanguage";
import { RelatedCodeProvider } from "./_base/RelatedCodeProvider";
import { JavaRelatedProvider } from "./java/JavaRelatedProvider";
import { CodeFileCacheManager } from "../editor/cache/CodeFileCacheManager";

export class RelatedCodeProviderManager {
	private relatedMap: Map<SupportedLanguage, RelatedCodeProvider> = new Map();

	constructor(fileCacheManager: CodeFileCacheManager) {
		this.relatedMap = new Map();
		this.relatedMap.set("java", new JavaRelatedProvider(fileCacheManager));
	}

	getRelatedProvider(lang: SupportedLanguage): RelatedCodeProvider | undefined {
		return this.relatedMap.get(lang);
	}
}
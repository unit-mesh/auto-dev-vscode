import { SupportedLanguage } from "../../language/SupportedLanguage";
import { RelatedProvider } from "./RelatedProvider";
import { JavaRelatedProvider } from "./JavaRelatedProvider";

export class RelatedProviderManager {
	private relatedMap: Map<SupportedLanguage, RelatedProvider> = new Map();

	constructor() {
		this.relatedMap = new Map();
		this.relatedMap.set("java", new JavaRelatedProvider());
	}

	getRelatedProvider(lang: SupportedLanguage): RelatedProvider | undefined {
		return this.relatedMap.get(lang);
	}
}
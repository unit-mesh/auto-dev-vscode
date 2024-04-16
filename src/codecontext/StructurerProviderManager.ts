import { SupportedLanguage } from "../editor/language/SupportedLanguage";
import { Structurer } from "./_base/Structurer";
import { JavaStructurer } from "./java/JavaStructurer";
import { DefaultLanguageService } from "../editor/language/service/DefaultLanguageService";

export class StructurerProviderManager {
	private structureMap: Map<SupportedLanguage, Structurer> = new Map();

	async init() {
		let map: Map<string, Structurer> = new Map();
		const structurer = new JavaStructurer();
		await structurer.init(new DefaultLanguageService());
		map.set("java", structurer);
		this.structureMap = map;
	}

	getStructurer(lang: SupportedLanguage): Structurer | undefined {
		return this.structureMap.get(lang);
	}
}

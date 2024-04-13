import { SupportedLanguage } from "../language/SupportedLanguage";
import { Structurer } from "./_base/Structurer";
import { JavaStructurer } from "./java/JavaStructurer";
import { DefaultLanguageService } from "../language/service/DefaultLanguageService";

export class StructurerProviderManager {
	private structureMap: Map<SupportedLanguage, Structurer> = new Map();

	async init() {
		const structurer = new JavaStructurer();
		await structurer.init(new DefaultLanguageService());

		let map: Map<string, Structurer> = new Map();
		map.set("java", structurer);
		this.structureMap = map;
	}

	getStructurer(lang: SupportedLanguage): Structurer | undefined {
		return this.structureMap.get(lang);
	}
}
import { SupportedLanguage } from "../language/SupportedLanguage";
import { Structurer } from "./Structurer";
import { JavaStructurer } from "./java/JavaStructurer";

export class StructureProvider {
	private structureMap: Map<SupportedLanguage, Structurer> = new Map();

	async init() {
		const structurer = new JavaStructurer();
		await structurer.init();

		let map: Map<string, Structurer> = new Map();
		map.set("java", structurer);
		this.structureMap = map;
	}

	getStructurer(lang: SupportedLanguage): Structurer | undefined {
		return this.structureMap.get(lang);
	}
}

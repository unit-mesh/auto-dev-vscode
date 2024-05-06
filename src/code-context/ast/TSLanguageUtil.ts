import { LanguageConfig } from "../_base/LanguageConfig";
import { JavaLangConfig } from "../java/JavaLangConfig";
import { TypeScriptLangConfig } from "../typescript/TypeScriptLangConfig";
import { GoLangConfig } from "../go/GoLangConfig";

export const ALL_LANGUAGES: LanguageConfig[] = [
	new JavaLangConfig(),
	new GoLangConfig(),
	new TypeScriptLangConfig(),
];

export class TSLanguageUtil {
	static for(langId: string): LanguageConfig | undefined {
		return ALL_LANGUAGES.find((target) => {
			return target.languageIds.some(
				(id) => id.toLowerCase() === langId.toLowerCase()
			);
		});
	}
}

import { LanguageProfile } from "../_base/LanguageProfile";
import { JavaProfile } from "../java/JavaProfile";
import { TypeScriptProfile } from "../typescript/TypeScriptProfile";
import { GolangProfile } from "../go/GolangProfile";

export const ALL_LANGUAGES: LanguageProfile[] = [
	new JavaProfile(),
	new GolangProfile(),
	new TypeScriptProfile(),
];

export class TSLanguageUtil {
	static for(langId: string): LanguageProfile | undefined {
		return ALL_LANGUAGES.find((target) => {
			return target.languageIds.some(
				(id) => id.toLowerCase() === langId.toLowerCase()
			);
		});
	}
}

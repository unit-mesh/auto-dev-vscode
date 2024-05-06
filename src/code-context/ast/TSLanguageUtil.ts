import { LanguageProfile } from "../_base/LanguageProfile";
import { PROVIDER_TYPES } from "../../ProviderTypes";
import { languageContainer } from "../../ProviderLanguageProfile.config";

export class TSLanguageUtil {
	static for(langId: string): LanguageProfile | undefined {
		let languageProfiles = languageContainer.getAll<LanguageProfile>(PROVIDER_TYPES.LanguageProfile);

		return languageProfiles.find((target) => {
			return target.languageIds.some(
				(id) => id.toLowerCase() === langId.toLowerCase()
			);
		});
	}
}


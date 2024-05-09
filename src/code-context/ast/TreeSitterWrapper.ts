import vscode from "vscode";
import { TreeSitterFile } from "./TreeSitterFile";
import { DefaultLanguageService } from "../../editor/language/service/DefaultLanguageService";
import { NamedElementBuilder } from "../../editor/ast/NamedElementBuilder";
import { TreeSitterFileManager } from "../../editor/cache/TreeSitterFileManager";
import { LanguageProfile } from "../_base/LanguageProfile";
import { languageContainer } from "../../ProviderLanguageProfile.config";
import { PROVIDER_TYPES } from "../../ProviderTypes";

/**
 * For fix generate code
 */
export async function textToTreeSitterFile(src: string, langId: string) {
	return TreeSitterFile.create(src, langId, new DefaultLanguageService());
}

export async function createNamedElement(document: vscode.TextDocument): Promise<NamedElementBuilder> {
	let file = await TreeSitterFileManager.create(document);
	return new NamedElementBuilder(file);
}

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
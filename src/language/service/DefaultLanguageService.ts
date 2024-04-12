import Parser from "web-tree-sitter";
import { TSLanguageService } from "./TSLanguageService";
import { getLanguage } from "../../parser/TreeSitterParser";

export class DefaultLanguageService extends TSLanguageService {
	async getLanguage(langId: string): Promise<Parser.Language | undefined> {
		return getLanguage(langId);
	}
}

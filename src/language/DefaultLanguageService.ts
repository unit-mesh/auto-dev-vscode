import { TSLanguageService } from "./TSLanguageService";
import Parser from "web-tree-sitter";
import { getLanguage } from "../parser/TreeSitterParser";

export class DefaultLanguageService implements TSLanguageService {
	async getLanguage(langId: string): Promise<Parser.Language | undefined> {
		return getLanguage(langId);
	}
}

import Parser, { Language } from "web-tree-sitter";
import { TestLanguageService } from "./TestLanguageService";
import { DefaultLanguageService } from "./DefaultLanguageService";

export class TSLanguageService {
	async getLanguage(langId: string): Promise<Parser.Language | undefined> {
		return undefined;
	}
}

export class LangServiceUtil {
	static async getLanguage(langId: string): Promise<Language | undefined> {
		if (process.env.NODE_ENV === 'test') {
			return new TestLanguageService().getLanguage(langId);
		} else {
			return new DefaultLanguageService().getLanguage(langId);
		}
	}
}
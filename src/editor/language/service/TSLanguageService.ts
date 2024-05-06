import Parser from "web-tree-sitter";

/**
 * Language service for tree-sitter languages, which include two implementations:
 *
 * - {@link DefaultLanguageService} used in source code
 * - {@link TestLanguageService} used in test code
 */
export class TSLanguageService {
	protected parser: Parser | undefined;

	async getLanguage(langId: string): Promise<Parser.Language | undefined> {
		return undefined;
	}

	getParser(): Parser | undefined {
		return this.parser;
	}
}

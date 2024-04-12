import Parser from "web-tree-sitter";

export class TSLanguageService {
	protected parser: Parser | undefined;

	async getLanguage(langId: string): Promise<Parser.Language | undefined> {
		return undefined;
	}

	getParser(): Parser | undefined {
		return this.parser;
	}
}

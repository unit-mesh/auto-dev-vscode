import Parser, { Query } from "web-tree-sitter";
import { SupportedLanguage } from "../language/supported";
import { TSLanguage } from "./TreeSitterLanguage";
import { CodeFile } from "../model/program";

export class StructureParser {
	protected parser: Parser | undefined;
	protected language: Parser.Language | undefined;

	async init(langId: SupportedLanguage): Promise<Query | undefined> {
		const tsConfig = TSLanguage.fromId(langId)!!;
		this.parser = new Parser();
		const language = await tsConfig.grammar();
		this.parser.setLanguage(language);
		return language?.query(tsConfig.structureQuery.scopeQuery)
	}

	protected async parseFile(code: string): Promise<CodeFile | undefined> {
		return undefined;
	}
}
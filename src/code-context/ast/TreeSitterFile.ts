import Parser, { Language, Tree } from "web-tree-sitter";

import { LanguageConfig } from "../_base/LanguageConfig";
import { TSLanguageUtil } from "./TSLanguageUtil";
import { TreeSitterFileCacheManager } from "../../editor/cache/TreeSitterFileCacheManager";
import { DefaultLanguageService } from "../../editor/language/service/DefaultLanguageService";
import { ScopeBuilder } from "../../code-search/ScopeBuilder";
import { ScopeGraph } from "../../code-search/ScopeGraph";

export class TreeSitterFile {
	private sourcecode: string;
	tree: Tree;
	langConfig: LanguageConfig;
	readonly parser: Parser | undefined = undefined;
	language: Parser.Language;

	constructor(
		src: string,
		tree: Tree,
		tsLanguage: LanguageConfig,
		parser: Parser,
		language: Language
	) {
		this.sourcecode = src;
		this.tree = tree;
		this.langConfig = tsLanguage;
		this.parser = parser;
		this.language = language;
	}

	static async tryBuild(
		src: string,
		langId: string,
		languageService: DefaultLanguageService
	): Promise<TreeSitterFile> {
		// no scope-res for files larger than 500kb
		if (src.length > 500 * Math.pow(10, 3)) {
			return Promise.reject(TreeSitterFileError.fileTooLarge);
		}

		const tsConfig = TSLanguageUtil.fromId(langId);
		if (tsConfig === undefined) {
			return Promise.reject(TreeSitterFileError.unsupportedLanguage);
		}

		const parser = new Parser();
		let language: Language | undefined = undefined;
		try {
			language = await tsConfig.grammar(languageService, langId);
			parser.setLanguage(language);
		} catch (error) {
			return Promise.reject(TreeSitterFileError.languageMismatch);
		}

		if (!language) {
			return Promise.reject(TreeSitterFileError.languageMismatch);
		}

		// do not permit files that take >1s to parse
		parser.setTimeoutMicros(Math.pow(10, 6));

		const tree = parser.parse(src);
		if (!tree) {
			return Promise.reject(TreeSitterFileError.parseTimeout);
		}

		return new TreeSitterFile(src, tree, tsConfig, parser, language);
	}

	static cache: TreeSitterFileCacheManager = new TreeSitterFileCacheManager();

	scopeGraph() : Promise<ScopeGraph> {
		let query = this.language.query(this.langConfig.scopeQuery.queryStr);
		let rootNode = this.tree.rootNode;

		let scopeBuilder = new ScopeBuilder(query, rootNode, this.sourcecode, this.langConfig);
		return scopeBuilder.build();
	}
}

export enum TreeSitterFileError {
	unsupportedLanguage,
	parseTimeout,
	languageMismatch,
	queryError,
	fileTooLarge,
}

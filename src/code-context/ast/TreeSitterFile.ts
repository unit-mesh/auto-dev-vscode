import Parser, { Language, Tree } from "web-tree-sitter";

import { LanguageConfig } from "../_base/LanguageConfig";
import { TSLanguageUtil } from "./TSLanguageUtil";
import { TreeSitterFileCacheManager } from "../../editor/cache/TreeSitterFileCacheManager";
import { ScopeBuilder } from "../../code-search/semantic/ScopeBuilder";
import { ScopeGraph } from "../../code-search/semantic/ScopeGraph";
import { TSLanguageService } from "../../editor/language/service/TSLanguageService";

const graphCache: Map<TreeSitterFile, ScopeGraph> = new Map();

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

	private static oneSecond: number = Math.pow(10, 6);

	static async tryBuild(
		source: string,
		langId: string,
		languageService: TSLanguageService
	): Promise<TreeSitterFile> {
		// no scope-res for files larger than 500kb
		let isLargerThan500kb = source.length > 500 * Math.pow(10, 3);
		if (isLargerThan500kb) {
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
		parser.setTimeoutMicros(this.oneSecond);

		const tree = parser.parse(source);
		if (!tree) {
			return Promise.reject(TreeSitterFileError.parseTimeout);
		}

		return new TreeSitterFile(source, tree, tsConfig, parser, language);
	}

	static cache: TreeSitterFileCacheManager = TreeSitterFileCacheManager.getInstance();

	/**
	 * The `scopeGraph` method is an asynchronous function that generates a scope graph for the current instance.
	 * A scope graph is a representation of the scopes and their relationships in a program.
	 * This method uses a `ScopeBuilder` to build the scope graph.
	 *
	 * The method first checks if a graph already exists in the cache (`graphCache`) for the current instance (`this`).
	 * If it does, it immediately returns a promise that resolves to the cached graph.
	 *
	 * If a graph does not exist in the cache, the method creates a new query using the language and the scope query string
	 * from the language configuration (`this.langConfig.scopeQuery.queryStr`).
	 * It then creates a new `ScopeBuilder` with the query, the root node of the tree (`this.tree.rootNode`),
	 * the source code (`this.sourcecode`), and the language configuration (`this.langConfig`).
	 *
	 * The method then awaits the building of the scope graph by the `ScopeBuilder`.
	 * Once the scope graph is built, it is added to the cache and returned as a promise.
	 *
	 * @returns {Promise<ScopeGraph>} A promise that resolves to a `ScopeGraph` object.
	 *
	 * @throws {Error} If the `ScopeBuilder` fails to build the scope graph.
	 *
	 * @async
	 */
	async scopeGraph(): Promise<ScopeGraph> {
		if (graphCache.has(this)) {
			return Promise.resolve(graphCache.get(this)!);
		}

		let query = this.language.query(this.langConfig.scopeQuery.queryStr);
		let rootNode = this.tree.rootNode;

		let scopeBuilder = new ScopeBuilder(query, rootNode, this.sourcecode, this.langConfig);
		let scopeGraphPromise = await scopeBuilder.build();

		graphCache.set(this, scopeGraphPromise);
		return scopeGraphPromise;
	}
}

export enum TreeSitterFileError {
	unsupportedLanguage,
	parseTimeout,
	languageMismatch,
	queryError,
	fileTooLarge,
}

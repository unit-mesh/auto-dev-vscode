import Parser, { Language, Tree } from "web-tree-sitter";

import { LanguageProfile, LanguageProfileUtil } from "../_base/LanguageProfile";
import { ScopeBuilder } from "../../code-search/scope-graph/ScopeBuilder";
import { ScopeGraph } from "../../code-search/scope-graph/ScopeGraph";
import { TSLanguageService } from "../../editor/language/service/TSLanguageService";
import { SupportedLanguage } from "../../editor/language/SupportedLanguage";
import { uuid } from "../../editor/webview/uuid";


const graphCache: Map<TreeSitterFile, ScopeGraph> = new Map();

export class TreeSitterFile {
	public tree: Tree;
	sourcecode: string;
	readonly languageProfile: LanguageProfile;
	readonly parser: Parser | undefined = undefined;
	readonly tsLanguage: Parser.Language;
	readonly filePath: string;

	constructor(src: string, tree: Tree, tsLanguage: LanguageProfile, parser: Parser, language: Language, fsPath: string = "") {
		this.sourcecode = src;
		this.tree = tree;
		this.languageProfile = tsLanguage;
		this.parser = parser;
		this.tsLanguage = language;
		this.filePath = fsPath;
	}

	private static oneSecond: number = Math.pow(10, 6);

	/**
	 * The `create` method is a static asynchronous method that creates a new instance of the `TreeSitterFile` class.
	 *
	 * @param source - A string representing the source code to be parsed.
	 * @param langId - A string representing the language identifier.
	 * @param languageService - An instance of the `TSLanguageService` class.
	 * @param fsPath - An optional string representing the file system path. Default value is an empty string.
	 *
	 * @returns A promise that resolves with a new instance of the `TreeSitterFile` class.
	 *
	 * This method first checks if the size of the source code is larger than 500kb. If it is, the method rejects the
	 * promise with a `TreeSitterFileError.fileTooLarge` error.
	 *
	 * Then, it retrieves the TypeScript configuration using the `TSLanguageUtil.fromId` method. If the configuration
	 * is undefined, the method rejects the promise with a `TreeSitterFileError.unsupportedLanguage` error.
	 *
	 * A new parser is created and the language is set using the `grammar` method of the TypeScript configuration.
	 * If an error occurs during this process, or if the language is undefined, the method rejects the promise with a
	 * `TreeSitterFileError.languageMismatch` error.
	 *
	 * The method sets a timeout for the parser to prevent files that take more than 1 second to parse. If the parsing
	 * process exceeds this limit, the method rejects the promise with a `TreeSitterFileError.parseTimeout` error.
	 *
	 * Finally, if all the previous steps are successful, the method creates a new instance of the `TreeSitterFile`
	 * class and resolves the promise with it.
	 *
	 */
	static async create(source: string, langId: string, languageService: TSLanguageService, fsPath: string = ""): Promise<TreeSitterFile> {
		// no node-res for files larger than 500kb
		let isLargerThan500kb = source.length > 500 * Math.pow(10, 3);
		if (isLargerThan500kb) {
			return Promise.reject(TreeSitterFileError.fileTooLarge);
		}

		const tsConfig = LanguageProfileUtil.from(langId);
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

		return new TreeSitterFile(source, tree, tsConfig, parser, language, fsPath);
	}

	update(tree: Parser.Tree, sourcecode: string) {
		this.tree = tree;
		this.sourcecode = sourcecode;
	}

	static async fromParser(parser: Parser, languageService: TSLanguageService, langId: SupportedLanguage, code: string): Promise<TreeSitterFile> {
		let langConfig = LanguageProfileUtil.from(langId)!!;
		const language = await langConfig.grammar(languageService, langId)!!;
		parser.setLanguage(language);

		let tree = parser.parse(code);
		return new TreeSitterFile(code, tree, langConfig, parser, language!!, "");
	}

	/**
	 * The `scopeGraph` method is an asynchronous function that generates a node graph for the current instance.
	 * A node graph is a representation of the scopes and their relationships in a program.
	 * This method uses a `ScopeBuilder` to build the node graph.
	 *
	 * The method first checks if a graph already exists in the cache (`graphCache`) for the current instance (`this`).
	 * If it does, it immediately returns a promise that resolves to the cached graph.
	 *
	 * If a graph does not exist in the cache, the method creates a new query using the language and the node query string
	 * from the language configuration (`this.langConfig.scopeQuery.queryStr`).
	 * It then creates a new `ScopeBuilder` with the query, the root node of the tree (`this.tree.rootNode`),
	 * the source code (`this.sourcecode`), and the language configuration (`this.langConfig`).
	 *
	 * The method then awaits the building of the node graph by the `ScopeBuilder`.
	 * Once the node graph is built, it is added to the cache and returned as a promise.
	 *
	 * @returns {Promise<ScopeGraph>} A promise that resolves to a `ScopeGraph` object.
	 *
	 * @throws {Error} If the `ScopeBuilder` fails to build the node graph.
	 *
	 * @async
	 */
	async scopeGraph(): Promise<ScopeGraph> {
		if (graphCache.has(this)) {
			return Promise.resolve(graphCache.get(this)!);
		}

		let query = this.languageProfile.scopeQuery.query(this.tsLanguage);
		let rootNode = this.tree.rootNode;

		let scopeBuilder = new ScopeBuilder(query, rootNode, this.sourcecode, this.languageProfile);
		let scopeGraphPromise = await scopeBuilder.build();

		graphCache.set(this, scopeGraphPromise);
		return scopeGraphPromise;
	}

	isTestFile() {
		return this.languageProfile.isTestFile(this.filePath);
	}
}

export enum TreeSitterFileError {
	unsupportedLanguage,
	parseTimeout,
	languageMismatch,
	queryError,
	fileTooLarge,
}

import Parser, { Language, Tree } from "web-tree-sitter";

import { LanguageProfile } from "../_base/LanguageProfile";
import { TSLanguageUtil } from "./TSLanguageUtil";
import { ScopeBuilder } from "../../code-search/scope-graph/ScopeBuilder";
import { ScopeGraph } from "../../code-search/scope-graph/ScopeGraph";
import { TSLanguageService } from "../../editor/language/service/TSLanguageService";

const graphCache: Map<TreeSitterFile, ScopeGraph> = new Map();

export class TreeSitterFile {
	readonly sourcecode: string;
	readonly tree: Tree;
	readonly langConfig: LanguageProfile;
	readonly parser: Parser | undefined = undefined;
	readonly language: Parser.Language;
	readonly filePath: string;

	constructor(src: string, tree: Tree, tsLanguage: LanguageProfile, parser: Parser, language: Language, fsPath: string = "") {
		this.sourcecode = src;
		this.tree = tree;
		this.langConfig = tsLanguage;
		this.parser = parser;
		this.language = language;
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

		const tsConfig = TSLanguageUtil.for(langId);
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

		let query = this.langConfig.scopeQuery.query(this.language);
		let rootNode = this.tree.rootNode;

		let scopeBuilder = new ScopeBuilder(query, rootNode, this.sourcecode, this.langConfig);
		let scopeGraphPromise = await scopeBuilder.build();

		graphCache.set(this, scopeGraphPromise);
		return scopeGraphPromise;
	}

	isTestFile() {
		// for java, test files are suffixed with Test, for example, HelloWorldTest.java, path should include test path
		let isJavaTest = this.filePath.endsWith("Test.java") && this.filePath.includes("test");

		// for python, test files are suffixed with _test, for example, test_hello_world.py
		let isPythonTest = this.filePath.endsWith("_test.py");

		// for javascript, test files are suffixed with .test, for example, hello-world.test.js
		let isJavaScriptTest = this.filePath.endsWith(".test.js") || this.filePath.endsWith(".spec.ts");

		// for typescript, test files are suffixed with .spec, for example, hello-world.spec.ts
		let isTypeScriptTest = this.filePath.endsWith(".test.js") || this.filePath.endsWith(".spec.ts");

		// for go, test files are suffixed with _test, for example, hello_world_test.go
		let isGoTest = this.filePath.endsWith("_test.go");

		// for ruby, test files are suffixed with _test, for example, hello_world_test.rb
		let isRubyTest = this.filePath.endsWith("_test.rb");

		return isJavaTest || isPythonTest || isJavaScriptTest || isTypeScriptTest || isGoTest || isRubyTest;
	}
}

export enum TreeSitterFileError {
	unsupportedLanguage,
	parseTimeout,
	languageMismatch,
	queryError,
	fileTooLarge,
}

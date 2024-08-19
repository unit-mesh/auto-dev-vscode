import Parser, { Language, Tree } from 'web-tree-sitter';

import { isLargerThan500kb } from 'base/common/files/files';
import { LanguageIdentifier } from 'base/common/languages/languages';
import { ILanguageServiceProvider } from 'base/common/languages/languageService';

import { ScopeBuilder } from '../../code-search/scope-graph/ScopeBuilder';
import { ScopeGraph } from '../../code-search/scope-graph/ScopeGraph';
import { LanguageProfile, LanguageProfileUtil } from '../_base/LanguageProfile';

const graphCache: Map<TreeSitterFile, ScopeGraph> = new Map();

export class TreeSitterFile {
	public tree: Tree;
	sourcecode: string;
	readonly languageProfile: LanguageProfile;
	readonly parser: Parser | undefined = undefined;
	readonly tsLanguage: Parser.Language;
	readonly filePath: string;

	constructor(
		src: string,
		tree: Tree,
		tsLanguage: LanguageProfile,
		parser: Parser,
		language: Language,
		fsPath: string = '',
	) {
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
	 * @param languageService - An instance of the `ILanguageServiceProvider` class.
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
	 * `TreeSitterFileError.languageMismatch` error. -
	 *
	 * The method sets a timeout for the parser to prevent files that take more than 1 second to parse. If the parsing
	 * process exceeds this limit, the method rejects the promise with a `TreeSitterFileError.parseTimeout` error.
	 *
	 * Finally, if all the previous steps are successful, the method creates a new instance of the `TreeSitterFile`
	 * class and resolves the promise with it.
	 *
	 */


	/**
	*`create`方法是一个静态异步方法，用于创建`TreeSitterFile`类的新实例。
	*
	*@param source-表示要解析的源代码的字符串。
	*@param langId-表示语言标识符的字符串。
	*@param languageService-“ILanguageServiceProvider”类的实例。
	*@param fsPath-表示文件系统路径的可选字符串。默认值为空字符串。
  *
	* @returns 返回一个promise，用`TreeSitterFile`类的新实例解析。
	*
  * 此方法首先检查源代码的大小是否大于500kb。如果是，则该方法拒绝
  * promise出现“TreeSitterFileError.fileTooLagge”错误。
  *
  * 然后，它使用`TSLanguageUtil.fromId`方法检索TypeScript配置。如果配置
  * 如果未定义，则该方法会以“TreeSitterFileError.unsupportdLanguage”错误拒绝promise。
  *
  * 创建了一个新的解析器，并使用TypeScript配置的“语法”方法设置语言。
  * 如果在此过程中发生错误，或者语言未定义，则该方法将使用
  * `TreeSitterFileError.languageMismatch`错误。
  *
  * 该方法为解析器设置超时，以防止解析时间超过1秒的文件。如果解析
  * 如果进程超过此限制，该方法将以“TreeSitterFileError.parseTimeout”错误拒绝promise。
  *
  * 最后，如果前面的所有步骤都成功，该方法将创建一个新的`TreeSitterFile实例`
  * 类，并用它解决promise。
 */
	static async create(
		source: string,
		langId: string,
		lsp: ILanguageServiceProvider,
		fsPath: string = '',
	): Promise<TreeSitterFile> {
		// no node-res for files larger than 500kb
		if (isLargerThan500kb(source)) {
			return Promise.reject(TreeSitterFileError.fileTooLarge);
		}

		const tsConfig = LanguageProfileUtil.from(langId);
		if (tsConfig === undefined) {
			return Promise.reject(TreeSitterFileError.unsupportedLanguage);
		}

		await lsp.ready();

		const parser = new Parser();
		let language: Language | undefined = undefined;
		try {
			language = await tsConfig.grammar(lsp, langId);
			parser.setLanguage(language);
		} catch (error) {
			console.error((error as Error).message);
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

	static async fromParser(
		parser: Parser,
		languageService: ILanguageServiceProvider,
		langId: LanguageIdentifier,
		code: string,
	): Promise<TreeSitterFile> {
		let langConfig = LanguageProfileUtil.from(langId)!!;
		const language = await langConfig.grammar(languageService, langId)!!;
		parser.setLanguage(language);

		let tree = parser.parse(code);
		return new TreeSitterFile(code, tree, langConfig, parser, language!!, '');
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
	 *-
	 * The method then awaits the building of the node graph by the `ScopeBuilder`.
	 * Once the node graph is built, it is added to the cache and returned as a promise.
	 *
	 * @returns {Promise<ScopeGraph>} A promise that resolves to a `ScopeGraph` object.
	 *
	 * @throws {Error} If the `ScopeBuilder` fails to build the node graph.
	 *
	 * @async
	 */


/**
 * “scopeGraph”方法是一个异步函数，为当前实例生成节点图。
 * 节点图是程序中作用域及其关系的表示。
 * 此方法使用“ScopeBuilder”构建节点图。
 *
 * 该方法首先检查当前实例（“this”）的缓存（“graphCache”）中是否已经存在图。
 * 如果这样做，它会立即返回一个解析为缓存图的promise。
 *
 * 如果缓存中不存在图，则该方法使用语言和节点查询字符串创建新的查询
 * 从语言配置（`this.langConfig.scopeQuery.queryStr`）。
 * 然后，它使用查询创建一个新的“ScopeBuilder”，即树的根节点（“this.tree.rootNode”），
 * 源代码（`this.sourcecode`）和语言配置（`this.langConfig`）。
 * 然后，该方法等待“ScopeBuilder”构建节点图。
 * 一旦构建了节点图，它就会被添加到缓存中并作为promise返回。
 * @returns {Promise<ScopeGraph>} 一个解析为`ScopeGraph`对象的promise。
 *
 * @throws {Error} 一个解析为`ScopeGraph`对象的promise。如果`ScopeBuilder`无法构建节点图。
 *
 *
 *  @async
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

export function convertToErrorMessage(error: TreeSitterFileError): string {
	switch (error) {
		case TreeSitterFileError.fileTooLarge:
			return 'File too large, please open a small file.';
		case TreeSitterFileError.languageMismatch:
			return 'Language mismatch, please open a supported file.';
		case TreeSitterFileError.parseTimeout:
			return 'Parse timeout, please open a small file.';
		case TreeSitterFileError.queryError:
			return 'Query error, please open a small file.';
		case TreeSitterFileError.unsupportedLanguage:
			return 'Unsupported language, please open a supported file.';
		default:
			return `Unknown error ${error}`;
	}
}

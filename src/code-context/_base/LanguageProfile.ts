import { Language, Query } from 'web-tree-sitter';

import { ILanguageServiceProvider } from 'base/common/languages/languageService';

import { NameSpaces } from '../../code-search/scope-graph/model/Namespace';
import { languageContainer } from '../../ProviderLanguageProfile.config';
import { ILanguageProfile } from '../../ProviderTypes';
import { LanguageIdentifier } from 'base/common/languages/languages';

/**
 * `LanguageProfile` is an interface that defines the structure of a language profile object.
 * This object contains information about a specific programming language that is used for code analysis and processing.
 */
export interface LanguageProfile {
	// A list of language names that can be processed by these node queries
	// e.g.: ["Typescript", "TSX"], ["Rust"]
	languageIds: string[];

	// Extensions that can help classify the file: .rs, .rb, .cabal
	fileExtensions: string[];

	// tree-sitter grammar for this language
	grammar: (langService: ILanguageServiceProvider, langId?: LanguageIdentifier) => Promise<Language | undefined>;

	// Compiled tree-sitter node query for this language.
	scopeQuery: MemoizedQuery;

	// Compiled tree-sitter hoverables query
	hoverableQuery: MemoizedQuery;

	// in java, the canonical name is the package name
	packageQuery?: MemoizedQuery;

	// class query
	classQuery: MemoizedQuery;

	// method query
	methodQuery: MemoizedQuery;

	blockCommentQuery: MemoizedQuery;

	// method input and output query
	methodIOQuery?: MemoizedQuery;

	fieldQuery?: MemoizedQuery;

	// structurer query
	structureQuery: MemoizedQuery;

	// Namespaces defined by this language,
	// E.g.: type namespace, variable namespace, function namespace
	namespaces: NameSpaces;

	// should select parent
	// for example, in JavaScript/TypeScript, if we select function, we should also select the export keyword.
	autoSelectInsideParent: string[];

	/// for IO analysis
	builtInTypes: string[];

	// should return true if the file is a test file
	isTestFile: (filePath: string) => boolean;
}

/**
 * The `MemoizedQuery` class is a TypeScript class that provides a way to cache and reuse a query.
 * This class is designed to improve performance by avoiding the overhead of recompiling the same query multiple times.
 *
 * The `MemoizedQuery` class has two private properties: `queryStr` and `compiledQuery`.
 * `queryStr` is a string that represents the query to be compiled and executed.
 * `compiledQuery` is an instance of the `Query` class that represents the compiled query. It is initially undefined and gets assigned when the `query` method is called for the first time.
 *
 * The constructor of the `MemoizedQuery` class takes a single argument: `scopeQuery`. This argument is a string that represents the query to be compiled and executed. The constructor assigns `scopeQuery` to `queryStr`.
 *
 * The `query` method of the `MemoizedQuery` class takes a single argument: `language`. This argument is an instance of the `Language` class that represents the language in which the query is written. The `query` method checks if `compiledQuery` is defined. If it is, the method returns `compiledQuery`. If it is not, the method compiles `queryStr` using the `query` method of the `language` object, assigns the result to `compiledQuery`, and then returns `compiledQuery`.
 *
 * The `MemoizedQuery` class is exported, which means that it can be imported and used in other TypeScript files.
 */


/**
 * MemorizedQuery类是一个TypeScript类，它提供了一种缓存和重用查询的方法。
 * 此类旨在通过避免多次重新编译同一查询的开销来提高性能。
 *
 * MemorizedQuery类有两个私有属性：queryStr和compiledQuery。
 * `queryStr`是一个字符串，表示要编译和执行的查询。
 * “compiledQuery”是表示已编译查询的“Query”类的实例。它最初是未定义的，在第一次调用`query`方法时被赋值。
 * MemoizedQuery类的构造函数只接受一个参数：scopeQuery。此参数是一个字符串，表示要编译和执行的查询。构造函数将`scopeQuery `分配给`queryStr`。
 *
 * MemoizedQuery类的query方法只接受一个参数：language。此参数是“Language”类的一个实例，该类表示编写查询的语言。`query `方法检查是否定义了`compiledQuery `。如果是，则该方法返回“compiledQuery”。如果不是，则该方法使用“language”对象的“query”方法编译“queryStr”，将结果分配给“compiledQuery”，然后返回“compilehQuery”。
 *
 * “MemorizedQuery”类被导出，这意味着它可以被导入并在其他TypeScript文件中使用。
*/


export class MemoizedQuery {
	private readonly queryStr: string;
	private compiledQuery: Query | undefined;

	constructor(scopeQuery: string) {
		this.queryStr = scopeQuery;
	}

	query(language: Language): Query {
		if (this.compiledQuery) {
			return this.compiledQuery;
		}

		this.compiledQuery = language.query(this.queryStr);
		return this.compiledQuery;
	}
}

/**
 * Utility class for working with tree-sitter languages.
 */
export class LanguageProfileUtil {
	static from(langId: string): LanguageProfile | undefined {
		let languageProfiles = languageContainer.getAll(ILanguageProfile);

		return languageProfiles.find(target => {
			return target.languageIds.some(id => id.toLowerCase() === langId.toLowerCase());
		});
	}
}

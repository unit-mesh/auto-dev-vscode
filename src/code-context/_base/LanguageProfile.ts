import { Language, Query } from "web-tree-sitter";

import { TSLanguageService } from "../../editor/language/service/TSLanguageService";
import { SupportedLanguage } from "../../editor/language/SupportedLanguage";
import { NameSpaces } from "../../code-search/scope-graph/model/Namespace";
import { languageContainer } from "../../ProviderLanguageProfile.config";
import { PROVIDER_TYPES } from "../../ProviderTypes";

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
	grammar: (langService: TSLanguageService, langId?: SupportedLanguage) => Promise<Language | undefined>;

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
		let languageProfiles = languageContainer.getAll<LanguageProfile>(PROVIDER_TYPES.LanguageProfile);

		return languageProfiles.find((target) => {
			return target.languageIds.some(
				(id) => id.toLowerCase() === langId.toLowerCase()
			);
		});
	}
}
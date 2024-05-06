import { Language, Query } from "web-tree-sitter";

import { TSLanguageService } from "../../editor/language/service/TSLanguageService";
import { SupportedLanguage } from "../../editor/language/SupportedLanguage";
import { NameSpaces } from "../../code-search/scope-graph/model/Namespace";

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

	builtInTypes: string[];
}

export class MemoizedQuery {
	private readonly queryStr: string;
	private cachedMap: Map<Language, Query> = new Map();

	constructor(scopeQuery: string) {
		this.queryStr = scopeQuery;
	}

	query(language: Language): Query {
		if (this.cachedMap.has(language)) {
			return this.cachedMap.get(language)!!;
		}

		let query = language.query(this.queryStr);
		this.cachedMap.set(language, query);
		return query;
	}
}

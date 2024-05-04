import { Language, Query } from "web-tree-sitter";

import { TSLanguageService } from "../../editor/language/service/TSLanguageService";
import { SupportedLanguage } from "../../editor/language/SupportedLanguage";
import { NameSpaces } from "../../code-search/semantic/model/Namespace";

// Languages based on tree-sitter grammars
export interface LanguageConfig {
  // A list of language names that can be processed by these scope queries
  // e.g.: ["Typescript", "TSX"], ["Rust"]
  languageIds: string[];

  // Extensions that can help classify the file: .rs, .rb, .cabal
  fileExtensions: string[];

  // tree-sitter grammar for this language
  grammar: (langService: TSLanguageService, langId: SupportedLanguage) => Promise<Language | undefined>;

  // Compiled tree-sitter scope query for this language.
  scopeQuery: MemoizedQuery;

  // Compiled tree-sitter hoverables query
  hoverableQuery: MemoizedQuery;

  // class query
  classQuery: MemoizedQuery;

  // method query
  methodQuery: MemoizedQuery;

  blockCommentQuery: MemoizedQuery;

  // method input and output query
  methodIOQuery?: MemoizedQuery;

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
  queryStr: string;

  constructor(scopeQuery: string) {
    this.queryStr = scopeQuery;
  }

  query(language: Language) : Query {
    return language.query(this.queryStr);
  }
}

import { Language, Query } from "web-tree-sitter";
import { TSLanguageService } from "../../editor/language/service/TSLanguageService";
import { SupportedLanguage } from "../../editor/language/SupportedLanguage";
import { NameSpaces } from "../../codesearch/model/Namespace";

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
}

export class MemoizedQuery {
  scopeQuery: string;

  constructor(scopeQuery: string) {
    this.scopeQuery = scopeQuery;
  }

  query(language: Language) : Query {
    return language.query(this.scopeQuery);
  }
}

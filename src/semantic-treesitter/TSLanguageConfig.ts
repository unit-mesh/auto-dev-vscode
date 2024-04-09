import { Language, Query } from "web-tree-sitter";

// Languages based on tree-sitter grammars
export interface TSLanguageConfig {
  // A list of language names that can be processed by these scope queries
  // e.g.: ["Typescript", "TSX"], ["Rust"]
  languageIds: string[];

  // Extensions that can help classify the file: .rs, .rb, .cabal
  fileExtensions: string[];

  // tree-sitter grammar for this language
  grammar: () => Promise<Language | undefined>;

  // Compiled tree-sitter scope query for this language.
  scopeQuery: MemoizedQuery;

  // Compiled tree-sitter hoverables query
  hoverableQuery: MemoizedQuery;

  // Namespaces defined by this language,
  // E.g.: type namespace, variable namespace, function namespace
  namespaces: NameSpaces;
}

export class MemoizedQuery {
  slot: Query = new Query();
  scopeQuery: string;

  constructor(scopeQuery: string) {
    this.scopeQuery = scopeQuery;
  }

  query() : Query {
    return this.slot;
  }
}

// A grouping of symbol kinds that allow references among them.
// A variable can refer only to other variables, and not types, for example.
export type NameSpace = string[];

// A collection of namespaces
export type NameSpaces = NameSpace[];

import Parser, { Language, Tree } from "web-tree-sitter";
import { TSLanguageConfig } from "./TSLanguageConfig";
import { TSLanguage } from "./TreeSitterLanguage";
import { TextRange } from "../document/TextRange";

export class TreeSitterFile {
  private src: string;
  private tree: Tree;
  private langConfig: TSLanguageConfig;
  private parser: Parser | undefined = undefined;
  private language: Parser.Language;

  constructor(
    src: string,
    tree: Tree,
    tsLanguage: TSLanguageConfig,
    parser: Parser,
    language: Language
  ) {
    this.src = src;
    this.tree = tree;
    this.langConfig = tsLanguage;
    this.parser = parser;
    this.language = language;
  }

  static async tryBuild(
    src: string,
    langId: string
  ): Promise<TreeSitterFileError | TreeSitterFile> {
    // no scope-res for files larger than 500kb
    if (src.length > 500 * Math.pow(10, 3)) {
      return TreeSitterFileError.FileTooLarge;
    }

    const tsLang = TSLanguage.fromId(langId);
    if (tsLang === undefined) {
      return TreeSitterFileError.UnsupportedLanguage;
    }

    const parser = new Parser();
    let language: Language | undefined = undefined;
    try {
      language = await tsLang.grammar();
      parser.setLanguage(language);
    } catch (error) {
      return TreeSitterFileError.LanguageMismatch;
    }

    if (!language) {
      return TreeSitterFileError.LanguageMismatch;
    }

    // do not permit files that take >1s to parse
    parser.setTimeoutMicros(Math.pow(10, 6));

    const tree = parser.parse(src);
    if (!tree) {
      return TreeSitterFileError.ParseTimeout;
    }

    return new TreeSitterFile(src, tree, tsLang, parser, language);
  }

  methodRanges(): TextRange[] | TreeSitterFileError {
    if (!this.parser) {
      return TreeSitterFileError.QueryError;
    }

    return this.getByQuery(this.langConfig.methodQuery.scopeQuery);
  }

  private getByQuery(queryString: string): TextRange[] | TreeSitterFileError {
    try {
      const query = this.language.query(queryString);
      const root = this.tree.rootNode;
      const matches = query?.matches(root);

      return (
        matches?.flatMap((match) => {
          // name.definition.method
          const node = match.captures[0].node;
          // definition.method
          const results = new TextRange(
            {
              line: node.startPosition.row,
              character: node.startPosition.column,
            },
            {
              line: node.endPosition.row,
              character: node.endPosition.column,
            },
            match.captures[1].node.text ?? ""
          );
          return results;
        }) ?? []
      );
    } catch (error) {
      return TreeSitterFileError.QueryError;
    }
  }
}

export enum TreeSitterFileError {
  UnsupportedLanguage,
  ParseTimeout,
  LanguageMismatch,
  QueryError,
  FileTooLarge,
}

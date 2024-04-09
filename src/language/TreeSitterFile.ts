import Parser, { Tree } from "web-tree-sitter";
import { TSLanguageConfig } from "../semantic-treesitter/TSLanguageConfig";
import { TSLanguage } from "./TreeSitterLanguage";

export class TreeSitterFile {
  private src: string;
  private tree: Tree;
  private langConfig: TSLanguageConfig;
  private parser: Parser | undefined = undefined;

  constructor(
    src: string,
    tree: Tree,
    language: TSLanguageConfig,
    parser: Parser
  ) {
    this.src = src;
    this.tree = tree;
    this.langConfig = language;
    this.parser = parser;
  }

  static async tryBuild(
    src: string,
    langId: string
  ): Promise<TreeSitterFileError | TreeSitterFile> {
    // no scope-res for files larger than 500kb
    if (src.length > 500 * Math.pow(10, 3)) {
      return TreeSitterFileError.FileTooLarge;
    }

    const language = TSLanguage.fromId(langId);
    if (language === undefined) {
      return TreeSitterFileError.UnsupportedLanguage;
    }

    const parser = new Parser();
    try {
      parser.setLanguage(await language.grammar());
    } catch (error) {
      return TreeSitterFileError.LanguageMismatch;
    }

    // do not permit files that take >1s to parse
    parser.setTimeoutMicros(Math.pow(10, 6));

    const tree = parser.parse(src);
    if (!tree) {
      return TreeSitterFileError.ParseTimeout;
    }

    return new TreeSitterFile(src, tree, language, parser);
  }

  hoverableRanges(): TextRange[] | TreeSitterFileError {
    if (!this.parser) {
      return TreeSitterFileError.QueryError;
    }

    try {
      //   const query = this.l.query(this.hoverableRange);
      //   const root = this.tree.rootNode;
      //   const matches = query?.matches(ast.rootNode);
    } catch (error) {
      return TreeSitterFileError.QueryError;
    }

    return [];
  }
}
/**
 *  range: {
    start: { line: number; character: number };
    end: { line: number; character: number };
  };
 */
export class TextRange {
  start: { line: number; character: number };
  end: { line: number; character: number };

  constructor(
    start: { line: number; character: number },
    end: { line: number; character: number }
  ) {
    this.start = start;
    this.end = end;
  }
}

export enum TreeSitterFileError {
  UnsupportedLanguage,
  ParseTimeout,
  LanguageMismatch,
  QueryError,
  FileTooLarge,
}

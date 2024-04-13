import * as vscode from "vscode";
import Parser, { Language, Tree } from "web-tree-sitter";

import { TSLanguageConfig } from "./langconfig/TSLanguageConfig";
import { TSLanguage } from "./TreeSitterLanguage";
import { TextRange } from "../document/TextRange";
import { IdentifierBlockRange } from "../document/IdentifierBlockRange";
import { TreeSitterFileCacheManager } from "../cache/TreeSitterFileCacheManager";
import { DefaultLanguageService } from "../language/service/DefaultLanguageService";

export class TreeSitterFile {
	private sourcecode: string;
	private tree: Tree;
	private langConfig: TSLanguageConfig;
	private readonly parser: Parser | undefined = undefined;
	private language: Parser.Language;

	constructor(
		src: string,
		tree: Tree,
		tsLanguage: TSLanguageConfig,
		parser: Parser,
		language: Language
	) {
		this.sourcecode = src;
		this.tree = tree;
		this.langConfig = tsLanguage;
		this.parser = parser;
		this.language = language;
	}

	/**
	 * catch build document
	 */
	static async tryBuild(
		src: string,
		langId: string
	): Promise<TreeSitterFileError | TreeSitterFile> {
		// no scope-res for files larger than 500kb
		if (src.length > 500 * Math.pow(10, 3)) {
			return TreeSitterFileError.FileTooLarge;
		}

		const tsConfig = TSLanguage.fromId(langId);
		if (tsConfig === undefined) {
			return TreeSitterFileError.UnsupportedLanguage;
		}

		const parser = new Parser();
		let language: Language | undefined = undefined;
		try {
			language = await tsConfig.grammar(new DefaultLanguageService(), langId);
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

		return new TreeSitterFile(src, tree, tsConfig, parser, language);
	}

	methodRanges(): IdentifierBlockRange[] | TreeSitterFileError {
		return !this.parser ? TreeSitterFileError.QueryError : this.getByQuery(this.langConfig.methodQuery.scopeQuery);

	}

	classRanges(): IdentifierBlockRange[] | TreeSitterFileError {
		return !this.parser ? TreeSitterFileError.QueryError : this.getByQuery(this.langConfig.classQuery.scopeQuery);
	}

	private getByQuery(queryString: string): IdentifierBlockRange[] | TreeSitterFileError {
		try {
			const query = this.language.query(queryString);
			const root = this.tree.rootNode;
			const matches = query?.matches(root);

			return (
				matches?.flatMap((match) => {
					const identifierNode = match.captures[0].node;
					const blockNode = match.captures[1].node;

					return new IdentifierBlockRange(
						TextRange.fromNode(identifierNode),
						TextRange.fromNode(blockNode)
					);
				}) ?? []
			);
		} catch (error) {
			return TreeSitterFileError.QueryError;
		}
	}

	static cache: TreeSitterFileCacheManager = new TreeSitterFileCacheManager();

	static async from(document: vscode.TextDocument) {
		const cached = TreeSitterFile.cache.getDocument(document.uri, document.version);
		if (cached) {
			return cached;
		}

		const src = document.getText();
		const langId = document.languageId;

		const file = await TreeSitterFile.tryBuild(src, langId);
		if (file instanceof TreeSitterFile) {
			TreeSitterFile.cache.setDocument(document.uri, document.version, file);
		}

		return file;
	}
}

export enum TreeSitterFileError {
	UnsupportedLanguage,
	ParseTimeout,
	LanguageMismatch,
	QueryError,
	FileTooLarge,
}

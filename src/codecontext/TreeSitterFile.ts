import Parser, { Language, Tree } from "web-tree-sitter";

import { LanguageConfig } from "./_base/LanguageConfig";
import { TSLanguageUtil } from "./TSLanguageUtil";
import { BlockRange } from "../editor/document/BlockRange";
import { IdentifierBlockRange } from "../editor/document/IdentifierBlockRange";
import { TreeSitterFileCacheManager } from "../editor/cache/TreeSitterFileCacheManager";
import { DefaultLanguageService } from "../editor/language/service/DefaultLanguageService";
import { ScopeBuilder } from "../codesearch/ScopeBuilder";
import { ScopeGraph } from "../codesearch/ScopeGraph";

export class TreeSitterFile {
	private sourcecode: string;
	private tree: Tree;
	private langConfig: LanguageConfig;
	private readonly parser: Parser | undefined = undefined;
	private language: Parser.Language;

	constructor(
		src: string,
		tree: Tree,
		tsLanguage: LanguageConfig,
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
	): Promise<TreeSitterFile> {
		// no scope-res for files larger than 500kb
		if (src.length > 500 * Math.pow(10, 3)) {
			return Promise.reject(TreeSitterFileError.fileTooLarge);
		}

		const tsConfig = TSLanguageUtil.fromId(langId);
		if (tsConfig === undefined) {
			return Promise.reject(TreeSitterFileError.unsupportedLanguage);
		}

		const parser = new Parser();
		let language: Language | undefined = undefined;
		try {
			language = await tsConfig.grammar(new DefaultLanguageService(), langId);
			parser.setLanguage(language);
		} catch (error) {
			return Promise.reject(TreeSitterFileError.languageMismatch);
		}

		if (!language) {
			return Promise.reject(TreeSitterFileError.languageMismatch);
		}

		// do not permit files that take >1s to parse
		parser.setTimeoutMicros(Math.pow(10, 6));

		const tree = parser.parse(src);
		if (!tree) {
			return Promise.reject(TreeSitterFileError.parseTimeout);
		}

		return new TreeSitterFile(src, tree, tsConfig, parser, language);
	}

	methodRanges(): IdentifierBlockRange[] | TreeSitterFileError {
		return !this.parser ? TreeSitterFileError.queryError : this.buildBlock(this.langConfig.methodQuery.queryStr);
	}

	classRanges(): IdentifierBlockRange[] | TreeSitterFileError {
		return !this.parser ? TreeSitterFileError.queryError : this.buildBlock(this.langConfig.classQuery.queryStr);
	}

	/**
	 * Searches the syntax tree for matches to the given query string and returns a list of identifier-block ranges.
	 *
	 * @param queryString The query string to match against the syntax tree.
	 * @returns An array of `IdentifierBlockRange` objects representing the matches, or a `TreeSitterFileError` if an error occurs.
	 */
	buildBlock(queryString: string): IdentifierBlockRange[] | TreeSitterFileError {
		try {
			const query = this.language.query(queryString);
			const root = this.tree.rootNode;
			const matches = query?.matches(root);

			return (
				matches?.flatMap((match) => {
					// check length if more than 2, the first one will be document
					let idIndex = 0;
					let blockIdentIndex = 1;
					let commentIndex = -1;
					let hasComment = match.captures.length > 2;
					if (hasComment) {
						commentIndex = 0;
						idIndex = 1;
						blockIdentIndex = 2;
					}

					const identifierNode = match.captures[idIndex].node;
					const blockNode = match.captures[blockIdentIndex].node;

					let blockRange = new IdentifierBlockRange(
						BlockRange.fromNode(identifierNode),
						BlockRange.fromNode(blockNode)
					);

					if (hasComment) {
						const commentNode = match.captures[commentIndex].node;
						blockRange.commentRange = BlockRange.fromNode(commentNode);
					}

					return blockRange;
				}) ?? []
			);
		} catch (error) {
			return TreeSitterFileError.queryError;
		}
	}

	static cache: TreeSitterFileCacheManager = new TreeSitterFileCacheManager();

	scopeGraph() : Promise<ScopeGraph> {
		let query = this.language.query(this.langConfig.scopeQuery.queryStr);
		let rootNode = this.tree.rootNode;

		let scopeBuilder = new ScopeBuilder(query, rootNode, this.sourcecode, this.langConfig);
		return scopeBuilder.build();
	}
}

export enum TreeSitterFileError {
	unsupportedLanguage,
	parseTimeout,
	languageMismatch,
	queryError,
	fileTooLarge,
}

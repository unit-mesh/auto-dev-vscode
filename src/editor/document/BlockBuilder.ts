import { IdentifierBlockRange } from "./IdentifierBlockRange";
import { BlockRange } from "./BlockRange";
import { TreeSitterFile, TreeSitterFileError } from "../../codecontext/TreeSitterFile";
import { LanguageConfig } from "../../codecontext/_base/LanguageConfig";
import Parser from "web-tree-sitter";

export class BlockBuilder {
	langConfig: LanguageConfig;
	tree: Parser.Tree;
	language: Parser.Language;
	parser: Parser | undefined = undefined;

	constructor(treeSitterFile: TreeSitterFile) {
		this.langConfig = treeSitterFile.langConfig;
		this.tree = treeSitterFile.tree;
		this.language = treeSitterFile.language;
		this.parser = treeSitterFile.parser;
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
}
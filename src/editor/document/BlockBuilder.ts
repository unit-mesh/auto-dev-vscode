import Parser from "web-tree-sitter";

import { NamedElementBlock } from "./NamedElementBlock";
import { BlockRange } from "./BlockRange";
import { TreeSitterFile, TreeSitterFileError } from "../../code-context/ast/TreeSitterFile";
import { LanguageConfig } from "../../code-context/_base/LanguageConfig";
import { CodeElementType } from "../codemodel/CodeElementType";
import { SyntaxNodeUtil } from "./SyntaxNodeUtil";
import vscode, { Position, Selection } from "vscode";
import { documentToTreeSitterFile } from "../../code-context/ast/TreeSitterFileUtil";

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

	static async from(document: vscode.TextDocument): Promise<BlockBuilder> {
		let file = await documentToTreeSitterFile(document);
		return new BlockBuilder(file);
	}

	buildMethod(): NamedElementBlock[] | TreeSitterFileError {
		return !this.parser ? TreeSitterFileError.queryError : this.buildBlock(this.langConfig.methodQuery.queryStr, CodeElementType.Method);
	}

	buildClass(): NamedElementBlock[] | TreeSitterFileError {
		return !this.parser ? TreeSitterFileError.queryError : this.buildBlock(this.langConfig.classQuery.queryStr, CodeElementType.Structure);
	}

	buildForPosition(selection: Selection): NamedElementBlock[] {
		const start: Position = selection.start;
		const end: Position = selection.end;

		const methodNodes = this.buildMethod();
		if (methodNodes instanceof Array) {
			return methodNodes
				.filter(node => node.blockRange.contains(start) && node.blockRange.contains(end));
		}

		const classNodes = this.buildClass();
		if (classNodes instanceof Array) {
			return classNodes
				.filter(node => node.blockRange.contains(start) && node.blockRange.contains(end));
		}

		return [];
	}

	/**
	 * Searches the syntax tree for matches to the given query string and returns a list of identifier-block ranges.
	 *
	 * @param queryString The query string to match against the syntax tree.
	 * @param elementType The type of code element that the query string represents.
	 * @returns An array of `IdentifierBlockRange` objects representing the matches, or a `TreeSitterFileError` if an error occurs.
	 */
	buildBlock(queryString: string, elementType: CodeElementType): NamedElementBlock[] | TreeSitterFileError {
		try {
			const query = this.language.query(queryString);
			const root = this.tree.rootNode;
			const matches = query?.matches(root);

			return (
				matches?.flatMap((match) => {
					const identifierNode = match.captures[0].node;
					const blockNode = match.captures[1].node;

					let commentNode = SyntaxNodeUtil.previousNodes(blockNode, ['block_comment', 'line_comment']);

					let blockRange = new NamedElementBlock(
						BlockRange.fromNode(identifierNode),
						BlockRange.fromNode(blockNode),
						elementType,
						blockNode.text,
					);

					if (commentNode.length > 0) {
						blockRange.commentRange = BlockRange.fromNode(commentNode[0]);
					}

					return blockRange;
				}) ?? []
			);
		} catch (error) {
			return TreeSitterFileError.queryError;
		}
	}
}


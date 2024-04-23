import { NamedElementBlock } from "./NamedElementBlock";
import { BlockRange } from "./BlockRange";
import { TreeSitterFile, TreeSitterFileError } from "../../code-context/ast/TreeSitterFile";
import { LanguageConfig } from "../../code-context/_base/LanguageConfig";
import Parser, { SyntaxNode } from "web-tree-sitter";
import { CodeElementType } from "../codemodel/CodeElementType";

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

	buildMethod(): NamedElementBlock[] | TreeSitterFileError {
		return !this.parser ? TreeSitterFileError.queryError : this.buildBlock(this.langConfig.methodQuery.queryStr, CodeElementType.Method);
	}

	buildClass(): NamedElementBlock[] | TreeSitterFileError {
		return !this.parser ? TreeSitterFileError.queryError : this.buildBlock(this.langConfig.classQuery.queryStr, CodeElementType.Structure);
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

					// comment node

					let blockRange = new NamedElementBlock(
						BlockRange.fromNode(identifierNode),
						BlockRange.fromNode(blockNode),
						elementType,
						blockNode.text,
					);

					// if (hasComment) {
					// 	const commentNode = match.captures[commentIndex].node;
					// 	blockRange.commentRange = BlockRange.fromNode(commentNode);
					// }

					return blockRange;
				}) ?? []
			);
		} catch (error) {
			return TreeSitterFileError.queryError;
		}
	}

	getPreviousNodesOfType(node: SyntaxNode, nodeNames: string[] = ['comment']): SyntaxNode[] {
		let results: SyntaxNode[] = [];
		let preNode: SyntaxNode | null = node.previousNamedSibling;

		while (preNode && nodeNames.some(name => name === preNode?.type)) {
			results.push(preNode);
			preNode = preNode.previousNamedSibling;
		}

		return results.reverse();
	}
}
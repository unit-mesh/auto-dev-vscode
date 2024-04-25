import Parser from "web-tree-sitter";

import { NamedElement } from "./NamedElement";
import { BlockRange } from "./BlockRange";
import { TreeSitterFile } from "../../code-context/ast/TreeSitterFile";
import { LanguageConfig } from "../../code-context/_base/LanguageConfig";
import { CodeElementType } from "../codemodel/CodeElementType";
import vscode from "vscode";
import { documentToTreeSitterFile } from "../../code-context/ast/TreeSitterFileUtil";
import { previousNodesOfType } from "../../code-context/ast/TreeSitterUtil";

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

	buildMethod(): NamedElement[] {
		return this.buildBlock(this.langConfig.methodQuery.queryStr, CodeElementType.Method);
	}

	buildClass(): NamedElement[] {
		return this.buildBlock(this.langConfig.classQuery.queryStr, CodeElementType.Structure);
	}

	buildForLine(lineNo: number): NamedElement[] {
		const methodNodes = this.buildMethod();
		 // todo: hande for typescript imports
		let methodBlock = methodNodes.filter(
			node => lineNo >= node.blockRange.start.line && lineNo <= node.blockRange.end.line
		);
		if (methodBlock.length > 0) {
			return methodBlock;
		}

		const classNodes = this.buildClass();
		let classBlocks = classNodes.filter(
			node => lineNo >= node.blockRange.start.line && lineNo <= node.blockRange.end.line
		);
		if (classBlocks.length > 0) {
			return classBlocks;
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
	buildBlock(queryString: string, elementType: CodeElementType): NamedElement[] {
		try {
			const query = this.language.query(queryString);
			const root = this.tree.rootNode;
			const matches = query?.matches(root);

			return (
				matches?.flatMap((match) => {
					const idNode = match.captures[1].node;
					let blockNode = match.captures[0].node;

					if (this.langConfig.autoSelectInsideParent.length > 0) {
						this.langConfig.autoSelectInsideParent.forEach((nodeType) => {
							if (blockNode.parent?.type === nodeType) {
								blockNode = blockNode.parent;
							}
						});
					}

					let commentNode = previousNodesOfType(blockNode, ['block_comment', 'line_comment']);

					let blockRange = new NamedElement(
						BlockRange.fromNode(blockNode),
						BlockRange.fromNode(idNode),
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
			console.error(error);
			return [];
		}
	}
}


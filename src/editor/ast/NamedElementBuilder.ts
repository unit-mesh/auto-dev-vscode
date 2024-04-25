import Parser from "web-tree-sitter";

import { NamedElement } from "./NamedElement";
import { TextInRange } from "./TextInRange";
import { TreeSitterFile } from "../../code-context/ast/TreeSitterFile";
import { LanguageConfig } from "../../code-context/_base/LanguageConfig";
import { CodeElementType } from "../codemodel/CodeElementType";
import vscode from "vscode";
import { documentToTreeSitterFile } from "../../code-context/ast/TreeSitterFileUtil";
import { previousNodesOfType } from "../../code-context/ast/TreeSitterUtil";

export class NamedElementBuilder {
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

	static async from(document: vscode.TextDocument): Promise<NamedElementBuilder> {
		let file = await documentToTreeSitterFile(document);
		return new NamedElementBuilder(file);
	}

	buildVariable(): NamedElement[] {
		throw new Error("Method not implemented.");
	}

	buildMethod(): NamedElement[] {
		return this.buildBlock(this.langConfig.methodQuery.queryStr, CodeElementType.Method);
	}

	buildClass(): NamedElement[] {
		return this.buildBlock(this.langConfig.classQuery.queryStr, CodeElementType.Structure);
	}

	/**
	 * The `getElementForAction` method is used to get the named elements (either method or class) that are present at a specific line number in the TypeScript code.
	 *
	 * @param lineNo - The line number in the TypeScript code.
	 *
	 * @returns An array of `NamedElement` objects. Each `NamedElement` object represents a method or class that is present at the specified line number. If no such elements are found, an empty array is returned.
	 *
	 * The method first builds a list of method nodes using the `buildMethod` function. It then filters this list to find the methods that are present at the specified line number. If any such methods are found, they are returned.
	 *
	 * If no methods are found at the specified line number, the method then builds a list of class nodes using the `buildClass` function. It filters this list to find the classes that are present at the specified line number. If any such classes are found, they are returned.
	 *
	 * If no methods or classes are found at the specified line number, the method returns an empty array.
	 *
	 * Note: This method currently does not handle TypeScript imports.
	 */
	getElementForAction(lineNo: number): NamedElement[] {
		const methodNodes = this.buildMethod();
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
						TextInRange.fromNode(blockNode),
						TextInRange.fromNode(idNode),
						elementType,
						blockNode.text,
					);

					if (commentNode.length > 0) {
						blockRange.commentRange = TextInRange.fromNode(commentNode[0]);
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


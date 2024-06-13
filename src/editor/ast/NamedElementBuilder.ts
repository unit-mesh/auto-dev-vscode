import Parser from 'web-tree-sitter';

import { LanguageProfile, MemoizedQuery } from '../../code-context/_base/LanguageProfile'; // TODO
import { TreeSitterFile } from '../../code-context/ast/TreeSitterFile'; // TODO
import { TreeSitterUtil } from '../../code-context/ast/TreeSitterUtil';
import { CodeElementType } from '../codemodel/CodeElementType';
import { NamedElement } from './NamedElement';
import { TextInRange } from './TextInRange';

/**
 * The `NamedElementBuilder` class is used to build named elements (such as variables, methods, and classes) from a
 * TreeSitter file. It uses the Tree-sitter parsing library to parse the source code and extract the named elements, like
 * - Class
 * - Method
 * - Variable
 *
 * @property {LanguageProfile} langConfig - The language configuration for the TypeScript file.
 * @property {Parser.Tree} tree - The syntax tree of the TypeScript file.
 * @property {Parser.Language} language - The language of the TypeScript file.
 * @property {Parser | undefined} parser - The parser used to parse the TypeScript file.
 *
 */
export class NamedElementBuilder {
	langConfig: LanguageProfile;
	tree: Parser.Tree;
	language: Parser.Language;
	parser: Parser | undefined = undefined;
	private file: TreeSitterFile;

	/**
	 * Creates a new `NamedElementBuilder` object.
	 *
	 * @param {TreeSitterFile} file - The TreeSitter file to build named elements from.
	 */
	constructor(file: TreeSitterFile) {
		this.langConfig = file.languageProfile;
		this.tree = file.tree;
		this.language = file.tsLanguage;
		this.parser = file.parser;
		this.file = file;
	}

	buildVariable(): NamedElement[] {
		throw new Error('Method not implemented.');
	}

	buildMethod(): NamedElement[] {
		return this.buildBlock(this.langConfig.methodQuery, CodeElementType.Method);
	}

	buildClass(): NamedElement[] {
		return this.buildBlock(this.langConfig.classQuery, CodeElementType.Structure);
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
		let methodBlock = methodNodes.filter(NamedElementBuilder.isIntersect(lineNo));
		if (methodBlock.length > 0) {
			return methodBlock;
		}

		const classNodes = this.buildClass();
		let classBlocks = classNodes.filter(NamedElementBuilder.isIntersect(lineNo));
		if (classBlocks.length > 0) {
			return classBlocks;
		}

		return [];
	}

	getElementForSelection(startLine: number, endLine: number): NamedElement[] {
		const methodNodes = this.buildMethod();
		let methodBlock = methodNodes.filter(NamedElementBuilder.isIntersectRange(startLine, endLine));
		if (methodBlock.length > 0) {
			return methodBlock;
		}

		const classNodes = this.buildClass();
		let classBlocks = classNodes.filter(NamedElementBuilder.isIntersectRange(startLine, endLine));
		if (classBlocks.length > 0) {
			return classBlocks;
		}

		return [];
	}

	private static isIntersect(lineNo: number) {
		return (node: NamedElement) => NamedElementBuilder.contains(node, lineNo);
	}

	private static contains(node: NamedElement, lineNo: number) {
		return lineNo >= node.blockRange.start.line && lineNo <= node.blockRange.end.line;
	}

	private static isIntersectRange(startLine: number, endLine: number) {
		return (node: NamedElement) => NamedElementBuilder.containsRange(node, startLine, endLine);
	}

	private static containsRange(node: NamedElement, startLine: number, endLine: number) {
		return startLine <= node.blockRange.start.line && endLine >= node.blockRange.end.line;
	}

	/**
	 * Searches the syntax tree for matches to the given query string and returns a list of identifier-block ranges.
	 *
	 * @param memoizedQuery The memoized query object to use for the search.
	 * @param elementType The type of code element that the query string represents.
	 * @returns An array of `IdentifierBlockRange` objects representing the matches, or a `TreeSitterFileError` if an error occurs.
	 */
	buildBlock(memoizedQuery: MemoizedQuery, elementType: CodeElementType): NamedElement[] {
		try {
			const query = memoizedQuery.query(this.language);
			const root = this.tree.rootNode;
			const matches = query?.matches(root);

			return (
				matches?.flatMap(match => {
					let blockNode = match.captures[0].node;
					const idNode = match.captures[1].node;

					let insideParent = this.langConfig.autoSelectInsideParent;
					if (insideParent.length > 0) {
						insideParent.forEach(nodeType => {
							if (blockNode.parent?.type === nodeType) {
								blockNode = blockNode.parent;
							}
						});
					}

					let blockRange = new NamedElement(
						TextInRange.fromNode(blockNode),
						TextInRange.fromNode(idNode),
						elementType,
						blockNode.text,
						this.file,
					);

					let commentNode = TreeSitterUtil.previousNodesOfType(blockNode, ['block_comment', 'line_comment']);
					if (commentNode.length > 0) {
						blockRange.commentRange = TextInRange.fromNode(commentNode[0]);
					}

					return blockRange;
				}) ?? []
			);
		} catch (error) {
			console.error(`NamedElementBuilder for ${this.langConfig}`, error);
			return [];
		}
	}
}

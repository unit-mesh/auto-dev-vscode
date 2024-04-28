import Parser, { SyntaxNode } from "web-tree-sitter";
import { ChunkWithoutID } from "./Chunk";
import { countTokens } from "../../token/TokenCounter";

export class CollapsedCodeChunker {
	async* parsedCodeChunker(
		parser: Parser,
		contents: string,
		maxChunkSize: number,
	): AsyncGenerator<ChunkWithoutID> {
		const tree = parser.parse(contents);
		yield* this.getSmartCollapsedChunks(tree.rootNode, contents, maxChunkSize);
	}

	collapsedReplacement(node: SyntaxNode): string {
		if (node.type === "statement_block") {
			return "{ ... }";
		} else {
			return "...";
		}
	}

	firstChild(
		node: SyntaxNode,
		grammarName: string | string[],
	): SyntaxNode | null {
		if (Array.isArray(grammarName)) {
			return (
				node.children.find((child) => grammarName.includes(child.type)) || null
			);
		} else {
			return node.children.find((child) => child.type === grammarName) || null;
		}
	}

	collapseChildren(
		node: SyntaxNode,
		code: string,
		blockTypes: string[],
		collapseTypes: string[],
		collapseBlockTypes: string[],
		maxChunkSize: number,
	): string {
		code = code.slice(0, node.endIndex);
		const block = this.firstChild(node, blockTypes);
		const collapsedChildren = [];

		if (block) {
			const childrenToCollapse = block.children.filter((child) =>
				collapseTypes.includes(child.type),
			);
			for (const child of childrenToCollapse.reverse()) {
				const grandChild = this.firstChild(child, collapseBlockTypes);
				if (grandChild) {
					const start = grandChild.startIndex;
					const end = grandChild.endIndex;
					const collapsedChild =
						code.slice(child.startIndex, start) +
						this.collapsedReplacement(grandChild);
					code =
						code.slice(0, start) +
						this.collapsedReplacement(grandChild) +
						code.slice(end);

					collapsedChildren.unshift(collapsedChild);
				}
			}
		}
		code = code.slice(node.startIndex);
		let removedChild = false;
		while (countTokens(code) > maxChunkSize && collapsedChildren.length > 0) {
			removedChild = true;
			// Remove children starting at the end - TODO: Add multiple chunks so no children are missing
			const childCode = collapsedChildren.pop()!;
			const index = code.lastIndexOf(childCode);
			if (index > 0) {
				code = code.slice(0, index) + code.slice(index + childCode.length);
			}
		}

		if (removedChild) {
			// Remove the extra blank lines
			let lines = code.split("\n");
			let firstWhiteSpaceInGroup = -1;
			for (let i = lines.length - 1; i >= 0; i--) {
				if (lines[i].trim() === "") {
					if (firstWhiteSpaceInGroup < 0) {
						firstWhiteSpaceInGroup = i;
					}
				} else {
					if (firstWhiteSpaceInGroup - i > 1) {
						// Remove the lines
						lines = [
							...lines.slice(0, i + 1),
							...lines.slice(firstWhiteSpaceInGroup + 1),
						];
					}
					firstWhiteSpaceInGroup = -1;
				}
			}

			code = lines.join("\n");
		}

		return code;
	}

	constructClassDefinitionChunk(
		node: SyntaxNode,
		code: string,
		maxChunkSize: number,
	): string {
		return this.collapseChildren(
			node,
			code,
			["block", "class_body", "declaration_list"],
			["method_definition", "function_definition", "function_item"],
			["block", "statement_block"],
			maxChunkSize,
		);
	}

	constructFunctionDefinitionChunk(
		node: SyntaxNode,
		code: string,
		maxChunkSize: number,
	): string {
		const bodyNode = node.children[node.children.length - 1];
		const funcText =
			code.slice(node.startIndex, bodyNode.startIndex) +
			this.collapsedReplacement(bodyNode);

		if (
			node.parent &&
			["block", "declaration_list"].includes(node.parent.type) &&
			node.parent.parent &&
			["class_definition", "impl_item"].includes(node.parent.parent.type)
		) {
			// If inside a class, include the class header
			const classNode = node.parent.parent;
			const classBlock = node.parent;
			return (
				code.slice(classNode.startIndex, classBlock.startIndex) +
				"...\n\n" +
				" ".repeat(node.startPosition.column) + // ...
				funcText
			);
		}
		return funcText;
	}

	collapsedNodeConstructors: { [key: string]: (node: SyntaxNode, code: string, maxChunkSize: number,) => string; } = {
		// Classes, structs, etc
		class_definition: this.constructClassDefinitionChunk.bind(this),
		class_declaration: this.constructClassDefinitionChunk.bind(this),
		impl_item: this.constructClassDefinitionChunk.bind(this),
		// Functions
		function_definition: this.constructFunctionDefinitionChunk.bind(this),
		function_declaration: this.constructFunctionDefinitionChunk.bind(this),
		function_item: this.constructFunctionDefinitionChunk.bind(this),
	};

	* getSmartCollapsedChunks(
		node: SyntaxNode,
		code: string,
		maxChunkSize: number,
		root = true,
	): Generator<ChunkWithoutID> {
		// Keep entire text if not over size
		if ((root || node.type in this.collapsedNodeConstructors) && countTokens(node.text) < maxChunkSize) {
			yield {
				content: node.text,
				startLine: node.startPosition.row,
				endLine: node.endPosition.row,
			};

			return;
		}

		// If a collapsed form is defined, use that
		if (node.type in this.collapsedNodeConstructors) {
			yield {
				content: this.collapsedNodeConstructors[node.type](node, code, maxChunkSize),
				startLine: node.startPosition.row,
				endLine: node.endPosition.row,
			};
		}

		// Recurse (because even if collapsed version was shown, want to show the children in full somewhere)
		for (const child of node.children) {
			yield* this.getSmartCollapsedChunks(child, code, maxChunkSize, false);
		}
	}
}
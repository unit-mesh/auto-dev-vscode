import { SyntaxNode } from "web-tree-sitter";

export namespace SyntaxNodeUtil {
	export function previousNodes(node: SyntaxNode, nodeTypes: string[]): SyntaxNode[] {
		let results: SyntaxNode[] = [];
		let preNode: SyntaxNode | null = node.previousNamedSibling;

		while (preNode && nodeTypes.some(name => name === preNode?.type)) {
			results.push(preNode);
			preNode = preNode.previousNamedSibling;
		}

		return results.reverse();
	}
}

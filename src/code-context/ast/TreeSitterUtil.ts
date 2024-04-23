import { SyntaxNode } from "web-tree-sitter";

export function isTopLevelNode(node: SyntaxNode): boolean {
	const rootNode = node.tree.rootNode;
	if (node === rootNode) {
		return true;
	}

	const parent = node.parent;
	if (!parent) {
		return false;
	}

	const grandParent = parent.parent;
	return !grandParent || grandParent === rootNode;
}

export function getParentOfType(node: SyntaxNode, type: string): SyntaxNode | null {
	let parent = node.parent;
	while (parent) {
		if (parent.type === type) {
			return parent;
		}
		parent = parent.parent;
	}
	return null;
}

export function previousNodesOfType(node: SyntaxNode, nodeTypes: string[]): SyntaxNode[] {
	let results: SyntaxNode[] = [];
	let preNode: SyntaxNode | null = node.previousNamedSibling;

	while (preNode && nodeTypes.some(name => name === preNode?.type)) {
		results.push(preNode);
		preNode = preNode.previousNamedSibling;
	}

	return results.reverse();
}

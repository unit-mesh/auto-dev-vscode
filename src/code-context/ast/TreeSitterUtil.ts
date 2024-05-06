import { SyntaxNode } from "web-tree-sitter";

export class TreeSitterUtil {
	static isTopLevelNode(node: SyntaxNode): boolean {
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

	static getParentOfType(node: SyntaxNode, type: string): SyntaxNode | null {
		let parent = node.parent;
		while (parent) {
			if (parent.type === type) {
				return parent;
			}
			parent = parent.parent;
		}
		return null;

	}

	/**
	 * The `previousNodesOfType` static method is used to find all previous sibling nodes of a specific type(s) for a given node in the syntax tree.
	 *
	 * @param node - The `SyntaxNode` for which previous sibling nodes of specific type(s) are to be found.
	 * @param nodeTypes - An array of string(s) representing the type(s) of the nodes to be found.
	 *
	 * @returns An array of `SyntaxNode` objects representing all the previous sibling nodes of the specified type(s). The nodes are returned in reverse order of their occurrence.
	 *
	 * The method starts by initializing an empty array `results` to store the found nodes. It then gets the immediate previous named sibling of the given node.
	 *
	 * It then enters a loop where it checks if the type of the current node matches any of the types specified in the `nodeTypes` array. If a match is found, the node is added to the `results` array and the method moves to the next previous named sibling.
	 *
	 * This process continues until there are no more previous named siblings or a sibling node that does not match any of the specified types is found.
	 *
	 * Finally, the method returns the `results` array in reverse order.
	 *
	 * Note: The method assumes that the `node` parameter is a valid `SyntaxNode` and the `nodeTypes` parameter is a valid array of strings. It does not perform any error checking or validation on these parameters.
	 *
	 * @static
	 */
	static previousNodesOfType(node: SyntaxNode, nodeTypes: string[]): SyntaxNode[] {
		let results: SyntaxNode[] = [];
		let preNode: SyntaxNode | null = node.previousNamedSibling;

		while (preNode && nodeTypes.some(name => name === preNode?.type)) {
			results.push(preNode);
			preNode = preNode.previousNamedSibling;
		}

		return results.reverse();
	}
}


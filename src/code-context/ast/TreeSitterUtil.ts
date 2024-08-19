import { SyntaxNode } from 'web-tree-sitter';

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

/**
*`previousNodesOfType`静态方法用于查找语法树中给定节点的特定类型的所有先前兄弟节点。
*
*@param node -可以找到特定类型的先前兄弟节点的“SyntaxNode”。
*@param nodeTypes -一个字符串数组，表示要查找的节点的类型。
*
*@return `SyntaxNode`对象数组，表示指定类型的所有先前兄弟节点。节点按其出现的相反顺序返回。
*
*该方法首先初始化一个空数组“results”来存储找到的节点。然后，它获取给定节点的前一个命名兄弟节点。
*
*然后，它进入一个循环，检查当前节点的类型是否与“nodeTypes”数组中指定的任何类型匹配。如果找到匹配项，则将节点添加到“results”数组中，并将方法移动到下一个之前命名的兄弟节点。
*
*此过程将继续，直到没有更多以前命名的兄弟节点或找到与任何指定类型都不匹配的兄弟节点为止。
*
*最后，该方法以相反的顺序返回“results”数组。
*
*注意：该方法假设`node`参数是有效的`SyntaxNode`，`nodeTypes`参数是一个有效的字符串数组。它不会对这些参数执行任何错误检查或验证。
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

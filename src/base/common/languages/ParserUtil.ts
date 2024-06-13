import Parser from 'web-tree-sitter';

export async function getTreePathAtCursor(
	ast: Parser.Tree,
	cursorIndex: number,
): Promise<Parser.SyntaxNode[] | undefined> {
	const path = [ast.rootNode];
	while (path[path.length - 1].childCount > 0) {
		let foundChild = false;
		for (let child of path[path.length - 1].children) {
			if (child.startIndex <= cursorIndex && child.endIndex >= cursorIndex) {
				path.push(child);
				foundChild = true;
				break;
			}
		}

		if (!foundChild) {
			break;
		}
	}

	return path;
}

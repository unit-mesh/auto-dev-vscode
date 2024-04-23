import { Position, Selection } from "vscode";
import { Point, SyntaxNode } from "web-tree-sitter";

export namespace PositionUtil {
	export function nodeToPosition(point: Point): Position {
		return new Position(point.row, point.column);
	}

	export function selectionFromNode(node: SyntaxNode): Selection {
		const start = nodeToPosition(node.startPosition);
		const end = nodeToPosition(node.endPosition);
		return new Selection(start, end);
	}
}
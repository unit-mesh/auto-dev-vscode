import { Position, Selection } from "vscode";
import { Point, SyntaxNode } from "web-tree-sitter";

export namespace PositionUtil {
	export function fromNode(point: Point): Position {
		return new Position(point.row, point.column);
	}

	export function toPoint(position: Position): Point {
		return { row: position.line, column: position.character };
	}

	export function selectionFromNode(node: SyntaxNode): Selection {
		const start = fromNode(node.startPosition);
		const end = fromNode(node.endPosition);
		return new Selection(start, end);
	}

	export function selectionToNode(selection: Selection): [Point, Point] {
		return [toPoint(selection.start), toPoint(selection.end)];
	}
}
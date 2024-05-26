import vscode, { Position, Selection } from "vscode";
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

export function selectCodeInRange(start: vscode.Position, end: vscode.Position) {
	const editor = vscode.window.activeTextEditor;
	if (editor) {
		const newSelection = new vscode.Selection(start, end);
		editor.selection = newSelection;
		editor.revealRange(newSelection);
	}
}

export function insertCodeByRange(textRange: Position, doc: string) {
	const editor = vscode.window.activeTextEditor;
	if (editor) {
		editor.edit((editBuilder) => {
			editBuilder.insert(textRange, doc);
		});
	}
}
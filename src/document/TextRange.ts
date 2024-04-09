import { Point, SyntaxNode } from "web-tree-sitter";
import { Position, Range } from "vscode";

export class TextRange extends Range {
	text: string;

	constructor(
		displayName: string = "",
		start: Position,
		end: Position
	) {
		super(start, end);
		this.text = displayName;
	}

	static fromNode(id: SyntaxNode) {
		const startPosition = new Position(id.startPosition.row, id.startPosition.column);
		const endPosition = new Position(id.endPosition.row, id.endPosition.column);

		return new TextRange(id.text, startPosition, endPosition);
	}
}
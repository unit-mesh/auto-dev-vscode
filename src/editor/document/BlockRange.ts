import { SyntaxNode } from "web-tree-sitter";
import { Position, Range } from "vscode";

export class BlockRange extends Range {
	text: string;
	startIndex: number;
	endIndex: number;

	private constructor(
		displayName: string = "",
		start: Position,
		end: Position,
		startIndex: number,
		endIndex: number
	) {
		super(start, end);
		this.text = displayName;
		this.startIndex = startIndex;
		this.endIndex = endIndex;
	}

	static fromNode(id: SyntaxNode) {
		const startPosition = new Position(id.startPosition.row, id.startPosition.column);
		const endPosition = new Position(id.endPosition.row, id.endPosition.column);

		const startIndex = id.startIndex;
		const endIndex = id.endIndex;

		return new BlockRange(id.text, startPosition, endPosition, startIndex, endIndex);
	}
}
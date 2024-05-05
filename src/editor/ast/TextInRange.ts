import { SyntaxNode } from "web-tree-sitter";
import { Position, Range } from "vscode";
import { Point, TextRange } from "../../code-search/scope-graph/model/TextRange";

export class TextInRange extends Range {
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

		return new TextInRange(id.text, startPosition, endPosition, startIndex, endIndex);
	}

	toTextRange() : TextRange {
		const start = new Point(this.start.line, this.start.character, this.startIndex);
		const end = new Point(this.end.line, this.end.character, this.endIndex);
		return new TextRange(start, end, this.text);
	}
}
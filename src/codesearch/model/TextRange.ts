import { SyntaxNode } from "web-tree-sitter";

export class Point {
	line: number;
	column: number;

	constructor(line: number, column: number) {
		this.line = line;
		this.column = column;
	}
}

export class TextRange {
	start: Point;
	end: Point;
	text: string;

	constructor(start: Point, end: Point, text: string) {
		this.start = start;
		this.end = end;
		this.text = text;
	}

	static from(node: SyntaxNode): TextRange {
		return new TextRange(
			{
				line: node.startPosition.row,
				column: node.startPosition.column,
			},
			{
				line: node.endPosition.row,
				column: node.endPosition.column,
			},
			node.text,
		)
	}


	/**
	 * Checks if the current text range contains the specified text range.
	 *
	 * @param other The text range to check for containment.
	 * @returns `true` if the current text range contains the specified text range; otherwise, `false`.
	 */
	public contains(other: TextRange): boolean {
		return this.start.line <= other.start.line && other.end.line <= this.end.line;
	}
}
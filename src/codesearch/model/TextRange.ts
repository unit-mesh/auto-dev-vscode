import { SyntaxNode } from "web-tree-sitter";

export class Point {
	byte: number;
	line: number;
	column: number;

	constructor(line: number, column: number, byte: number) {
		this.line = line;
		this.column = column;
		this.byte = byte;
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
				byte: node.startIndex,
				line: node.startPosition.row,
				column: node.startPosition.column
			},
			{
				byte: node.endIndex,
				line: node.endPosition.row,
				column: node.endPosition.column
			},
			node.text,
		);
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
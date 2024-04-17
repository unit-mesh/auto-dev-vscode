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
		return {
			text: node.text,
			start: {
				line: node.startPosition.row,
				column: node.startPosition.column,
			},
			end: {
				line: node.endPosition.row,
				column: node.endPosition.column,
			},
		};
	}
}
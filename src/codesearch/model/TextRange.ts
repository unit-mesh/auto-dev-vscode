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

	constructor(start: Point, end: Point) {
		this.start = start;
		this.end = end;
	}

	static from(node: SyntaxNode) {
		return {
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
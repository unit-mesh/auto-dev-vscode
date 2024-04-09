import { SyntaxNode } from "web-tree-sitter";

export class TextRange {
	text: string;
	start: { line: number; character: number };
	end: { line: number; character: number };

	constructor(
		displayName: string = "",
		start: { line: number; character: number },
		end: { line: number; character: number }
	) {
		this.start = start;
		this.end = end;
		this.text = displayName;
	}

	static fromNode(id: SyntaxNode) {
		return new TextRange(
			id.text,
			{ line: id.startPosition.row, character: id.startPosition.column },
			{ line: id.endPosition.row, character: id.endPosition.column },
		);
	}
}
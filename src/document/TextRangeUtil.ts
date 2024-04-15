import { SyntaxNode } from "web-tree-sitter";
import { TextRange } from "./TextRange";
import { Point } from "./Point";

export class TextRangeUtil {
	static fromNode(id: SyntaxNode) {
		const startPosition = new Point(id.startPosition.row, id.startPosition.column);
		const endPosition = new Point(id.endPosition.row, id.endPosition.column);


		return new TextRange(id.text, startPosition, endPosition);
	}
}
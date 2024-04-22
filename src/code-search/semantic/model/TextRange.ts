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
	private text: string;

	constructor(start: Point, end: Point, text: string) {
		this.start = start;
		this.end = end;
		this.text = text;
	}

	getText(): string {
		return this.text;
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


	//     fn cmp(&self, other: &Self) -> Ordering {
	//         let compare_start_byte = self.start.byte.cmp(&other.start.byte);
	//         let compare_size = self.size().cmp(&other.size());
	//
	//         compare_start_byte.then(compare_size)
	//     }
	public compare(other: TextRange): number {
		const compareStartByte = this.start.byte - other.start.byte;
		const compareSize = this.size() - other.size();

		if (compareStartByte === 0) {
			return compareSize;
		}

		return compareStartByte;
	}

	//     pub fn size(&self) -> usize {
	//         self.end.byte.saturating_sub(self.start.byte)
	//     }
	public size(): number {
		return this.end.byte - this.start.byte;
	}
}
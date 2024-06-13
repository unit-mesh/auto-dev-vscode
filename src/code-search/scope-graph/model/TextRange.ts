import { SyntaxNode } from 'web-tree-sitter';

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
	private readonly text: string;

	constructor(start: Point, end: Point, text: string) {
		this.start = start;
		this.end = end;
		this.text = text;
	}

	getText(): string {
		return this.text;
	}

	static empty(): TextRange {
		return new TextRange(new Point(0, 0, 0), new Point(0, 0, 0), '');
	}

	static from(node: SyntaxNode): TextRange {
		let text = this.extracted(node);

		return new TextRange(
			{
				byte: node.startIndex,
				line: node.startPosition.row,
				column: node.startPosition.column,
			},
			{
				byte: node.endIndex,
				line: node.endPosition.row,
				column: node.endPosition.column,
			},
			text,
		);
	}

	private static extracted(node: SyntaxNode) {
		if (node.type === 'interpreted_string_literal') {
			return JSON.parse(node.text);
		}

		return node.text;
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

	public compare(other: TextRange): number {
		const compareStartByte = this.start.byte - other.start.byte;
		const compareSize = this.size() - other.size();

		if (compareStartByte === 0) {
			return compareSize;
		}

		return compareStartByte;
	}

	public size(): number {
		return this.end.byte - this.start.byte;
	}

	contentFromRange(src: string): string {
		const contextStart = (() => {
			for (let i = this.start.byte - 1; i >= 0; i--) {
				if (src[i] === '\n') {
					return i + 1;
				}
			}
			return 0;
		})();

		// first new line after end
		const contextEnd = (() => {
			for (let i = this.end.byte; i < src.length; i++) {
				if (src[i] === '\n') {
					return i;
				}
			}
			return src.length;
		})();

		return [
			src.slice(contextStart, this.start.byte).trimStart(),
			src.slice(this.start.byte, this.end.byte),
			src.slice(this.end.byte, contextEnd).trimEnd(),
		].join('');
	}
}

export class Point {
	line: number;
	column: number;

	constructor(line: number, column: number) {
		this.line = line;
		this.column = column;
	}
}

export class TextRange {
	start: number;
	end: number;

	constructor(start: number, end: number) {
		this.start = start;
		this.end = end;
	}

	get length(): number {
		return this.end - this.start;
	}
}
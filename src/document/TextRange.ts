export class TextRange {
	text: string;
	start: { line: number; character: number };
	end: { line: number; character: number };

	constructor(
		start: { line: number; character: number },
		end: { line: number; character: number },
		displayName: string = ""
	) {
		this.start = start;
		this.end = end;
		this.text = displayName;
	}
}
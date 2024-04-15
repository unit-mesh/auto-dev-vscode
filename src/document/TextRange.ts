import { Point } from "./Point";

export class TextRange {
	text: string;
	start: Point;
	end: Point;

	constructor(
		displayName: string = "",
		start: Point,
		end: Point
	) {
		this.text = displayName;
		this.start = start;
		this.end = end;
	}
}

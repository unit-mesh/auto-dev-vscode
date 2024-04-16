import { TextRange } from "../model/TextRange";

export class LocalScope {
	range: TextRange;

	constructor(range: TextRange) {
		this.range = range;
	}
}

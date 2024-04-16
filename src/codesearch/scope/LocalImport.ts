import { TextRange } from "../model/TextRange";
import { NodeKind } from "./NodeKind";

export class LocalImport implements NodeKind {
	range: TextRange;

	constructor(range: TextRange) {
		this.range = range;
	}
}
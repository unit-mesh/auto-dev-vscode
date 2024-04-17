import { TextRange } from "../model/TextRange";
import { NodeKind } from "./NodeKind";

export class LocalScope implements NodeKind {
	range: TextRange;

	constructor(range: TextRange) {
		this.range = range;
	}
}

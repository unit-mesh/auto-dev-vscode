import { TextRange } from "../model/TextRange";
import { NodeKind } from "./NodeKind";

export class LocalScope implements NodeKind {
	range: TextRange;
	name: string | undefined;

	constructor(range: TextRange) {
		this.range = range;
		this.name = "LocalScope";
	}
}

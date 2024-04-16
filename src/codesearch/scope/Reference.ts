import { TextRange } from "../model/TextRange";
import { SymbolId } from "../model/Namespace";
import { NodeKind } from "./NodeKind";

export class Reference implements NodeKind {
	range: TextRange;
	symbolId: SymbolId | null;

	constructor(range: TextRange, symbolId: SymbolId | null) {
		this.range = range;
		this.symbolId = symbolId;
	}
}

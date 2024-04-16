import { TextRange } from "../model/TextRange";
import { SymbolId } from "../model/Namespace";

export class Reference {
	range: TextRange;
	symbolId: SymbolId | null;

	constructor(range: TextRange, symbolId: SymbolId | null) {
		this.range = range;
		this.symbolId = symbolId;
	}
}

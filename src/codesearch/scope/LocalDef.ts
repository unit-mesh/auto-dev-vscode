import { SymbolId } from "../Namespace";
import { TextRange } from "../../editor/document/TextRange";

class LocalDef {
	range: TextRange;
	symbolId: SymbolId | null;

	constructor(range: TextRange, symbolId: SymbolId | null) {
		this.range = range;
		this.symbolId = symbolId;
	}
}
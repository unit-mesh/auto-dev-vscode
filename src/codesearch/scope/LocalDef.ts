import { SymbolId } from "../Namespace";
import { TextRange } from "../../document/TextRange";

class LocalDef {
	range: TextRange;
	symbol_id: SymbolId | null;

	constructor(range: TextRange, symbol_id: SymbolId | null) {
		this.range = range;
		this.symbol_id = symbol_id;
	}
}
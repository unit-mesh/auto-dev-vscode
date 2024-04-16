import { SymbolId } from "../model/Namespace";
import { BlockRange } from "../../editor/document/BlockRange";

class LocalDef {
	range: BlockRange;
	symbolId: SymbolId | null;

	constructor(range: BlockRange, symbolId: SymbolId | null) {
		this.range = range;
		this.symbolId = symbolId;
	}
}
import { SymbolId } from "../model/Namespace";
import { TextRange } from "../model/TextRange";
import { NodeKind } from "./NodeKind";

/// A definition node
export class LocalDef extends NodeKind {
	range: TextRange;
	symbolId?: SymbolId | null;

	constructor(range: TextRange, symbolId?: SymbolId | null) {
		super(range);
		this.range = range;
		this.symbolId = symbolId;
	}
}

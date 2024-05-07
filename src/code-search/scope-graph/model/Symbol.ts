import { ScopeGraph } from "../ScopeGraph";
import { TextRange } from "./TextRange";

export class Symbol {
	constructor(public kind: string, public range: TextRange) {

	}

	symbolLocations(scopeGraph: ScopeGraph, buffer: string) {
		let symbols = scopeGraph.symbols()
			.map(sym => buffer.slice(sym.range.start.byte, sym.range.end.byte))
			.reduce((set, sym) => set.add(sym), new Set());

		return Array.from(symbols).join("\n");
	}
}
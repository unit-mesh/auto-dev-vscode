export type NameSpace = Array<string>;
export type NameSpaces = Array<NameSpace>;

export interface SymbolId {
	namespace_idx: number;
	symbol_idx: number;
}

export function name(symbolId: SymbolId, namespaces: NameSpaces): string {
	return namespaces[symbolId.namespace_idx][symbolId.symbol_idx];
}

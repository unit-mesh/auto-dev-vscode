export type NameSpace = Array<string>;
export type NameSpaces = Array<NameSpace>;

export interface SymbolId {
	nameSpaceIndex: number;
	symbolIndex: number;
}

export function name(symbolId: SymbolId, namespaces: NameSpaces): string {
	return namespaces[symbolId.nameSpaceIndex][symbolId.symbolIndex];
}

export type NameSpace = Array<string>;
export type NameSpaces = Array<NameSpace>;

export interface SymbolId {
	nameSpaceIndex: number;
	symbolIndex: number;
}

export function name(symbolId: SymbolId, namespaces: NameSpaces): string {
	return namespaces[symbolId.nameSpaceIndex][symbolId.symbolIndex];
}

export function allSymbols(namespaces: NameSpaces): string[] {
	return namespaces
		.flatMap(ns => ns.slice())
		.filter((symbol, index, arr) => arr.indexOf(symbol) === index);
}

export function symbolIdOf(namespaces: NameSpaces, symbol: string): SymbolId | undefined {
	for (let namespaceIdx = 0; namespaceIdx < namespaces.length; namespaceIdx++) {
		const symbolIdx = namespaces[namespaceIdx].indexOf(symbol);
		if (symbolIdx !== -1) {
			return {
				nameSpaceIndex: namespaceIdx,
				symbolIndex: symbolIdx
			};
		}
	}
	return undefined;
}

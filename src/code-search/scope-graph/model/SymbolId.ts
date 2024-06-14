import { NameSpaces } from './Namespace';

export interface SymbolId {
	namespaceIndex: number;
	symbolIndex: number;
}

export function nameOfSymbol(namespaces: NameSpaces, symbolId: SymbolId): string {
	return namespaces[symbolId.namespaceIndex][symbolId.symbolIndex];
}

export function allSymbols(namespaces: NameSpaces): string[] {
	return namespaces.flatMap(ns => ns.slice()).filter((symbol, index, arr) => arr.indexOf(symbol) === index);
}

export function symbolIdOf(namespaces: NameSpaces, symbol: string): SymbolId | undefined {
	for (let namespaceIdx = 0; namespaceIdx < namespaces.length; namespaceIdx++) {
		const symbolIdx = namespaces[namespaceIdx].indexOf(symbol);
		if (symbolIdx !== -1) {
			return {
				namespaceIndex: namespaceIdx,
				symbolIndex: symbolIdx,
			};
		}
	}

	return undefined;
}

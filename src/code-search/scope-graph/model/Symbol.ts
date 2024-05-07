import { ScopeGraph } from "../ScopeGraph";
import { TextRange } from "./TextRange";

export class Symbol {
	constructor(public kind: string, public range: TextRange) {

	}

	/**
	 * The `symbolLocations` static method is used to extract and return all the symbols from a given scope graph as a string, each symbol separated by a newline.
	 *
	 * @param {ScopeGraph} scopeGraph - The scope graph from which symbols are to be extracted. A scope graph is a data structure that represents the scopes and bindings in a program.
	 * @param {string} buffer - The string from which the symbols are sliced based on their range in the scope graph.
	 *
	 * @returns {string} - Returns a string of symbols separated by a newline. Each symbol is a substring of the buffer, sliced based on its range in the scope graph.
	 *
	 * The method first extracts all the symbols from the scope graph and maps them to their corresponding substrings in the buffer using the `slice` method.
	 * It then reduces this array of substrings into a Set to remove any duplicates.
	 * Finally, it converts this Set back into an array and joins all the elements into a single string with each symbol separated by a newline.
	 *
	 * Note: This method does not modify the original scope graph or buffer.
	 */
	static symbolLocations(scopeGraph: ScopeGraph, buffer: string) {
		let symbols = scopeGraph.symbols()
			.map(sym => buffer.slice(sym.range.start.byte, sym.range.end.byte))
			.reduce((set, sym) => set.add(sym), new Set());

		return Array.from(symbols).join("\n");
	}
}
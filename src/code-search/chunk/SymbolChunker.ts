/**
 * SymbolChunker will build with symbol information, the symbol information will be used to build the [ScopeGraph]
 *
 * For example, in javascript, the symbol information will be the:
 * - package name
 * - class name
 * - method name
 */
export class SymbolChunker {
	public static chunk(text: string): string[] {
		return text.split(/\s+/);
	}
}

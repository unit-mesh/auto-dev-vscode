export class SymbolChunker {
	public static chunk(text: string): string[] {
		return text.split(/\s+/);
	}
}

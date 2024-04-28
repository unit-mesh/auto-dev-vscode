export class ConstructCodeChunker {
	// call chunk document
	public static chunk(text: string): string[] {
		return text.split(/\s+/);
	}
}
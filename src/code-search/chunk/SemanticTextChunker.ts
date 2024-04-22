export class SemanticTextChunker {
	public static chunk(text: string): string[] {
		return text.split(/\s+/);
	}
}
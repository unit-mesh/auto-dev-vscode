export class OutlineChunker {
	public static chunk(text: string): string[] {
		return text.split(/\s+/);
	}
}
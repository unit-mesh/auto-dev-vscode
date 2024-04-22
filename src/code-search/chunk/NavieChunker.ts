export class NavieChunker {
	public static chunk(text: string): string[] {
		return text.split(/\s+/);
	}
}
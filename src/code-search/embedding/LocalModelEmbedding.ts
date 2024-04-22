export class LocalModelEmbedding {
	public static async embed(text: string): Promise<number[]> {
		return text.split('').map((char) => char.charCodeAt(0));
	}
}
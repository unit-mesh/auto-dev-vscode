import { RemoteEmbedding } from "./RemoteEmbedding";
import { Embedding } from "./Embedding";

export class OpenAIEmbedding extends RemoteEmbedding {
	override async embed(text: string): Promise<Embedding> {
		return text.split('').map((char) => char.charCodeAt(0));
	}
}
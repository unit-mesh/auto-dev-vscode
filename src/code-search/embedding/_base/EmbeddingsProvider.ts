import { Embedding } from "./Embedding";

export interface EmbeddingsProvider {
	id: string;
	embed(chunks: string[]): Promise<Embedding[]>;
}

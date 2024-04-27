import { Embedding } from "./Embedding";

export interface EmbeddingProvider {
	id: string;
	embed(chunks: string[]): Promise<Embedding[]>;
}
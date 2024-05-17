import { Embedding } from "./Embedding";

export interface EmbeddingsProvider {
	/**
	 * Unique identifier for the provider
	 */
	id: string;
	/**
	 * Accepts a list of code chunks and returns a list of embeddings data
	 */
	embed(chunks: string[]): Promise<Embedding[]>;
}

import { Embedding } from './Embedding';

export interface EmbeddingsProvider {
	/**
	 * Unique identifier for the provider
	 */
	id: string;
	/**
	 * A text content will split into multiple chunks.
	 * Accepts a list of code chunks and returns a list of embeddings data
	 */
	embed(chunks: string[]): Promise<Embedding[]>;
}

export enum EmbeddingsProviderType {
	Local = 'local',
	OpenAI = 'openai',
	Ollama = 'ollama',
}

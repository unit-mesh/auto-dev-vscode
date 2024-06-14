import { Embedding } from './Embedding';
import { EmbeddingsProvider } from './EmbeddingsProvider';

export class BaseEmbeddingsProvider implements EmbeddingsProvider {
	id: string;

	constructor(id: string) {
		this.id = id;
	}

	async embed(chunks: string[]): Promise<Embedding[]> {
		throw new Error('Method not implemented.');
	}
}

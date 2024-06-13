import { Chunk } from '../chunk/_base/Chunk';
import { Embedding } from '../embedding/_base/Embedding';

export interface Reranker {
	name: string;
	rerank(query: string, chunks: Chunk[]): Promise<Embedding>;
}

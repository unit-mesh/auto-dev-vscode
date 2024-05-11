import { Embedding } from "../embedding/_base/Embedding";
import { Chunk } from "../chunk/_base/Chunk";

export interface Reranker {
	name: string;
	rerank(query: string, chunks: Chunk[]): Promise<Embedding>;
}

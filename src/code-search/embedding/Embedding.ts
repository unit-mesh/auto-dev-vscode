import { TextRange } from "../model/TextRange";

export type Embedding = number[];

export interface EmbeddingItem {
	embedding: Embedding;
}

export interface ScoredItem<T> {
	score: number;
	item: T;
}

export interface ChunkItem {
	file: string;
	text: string;
	range: TextRange;
	embedding?: Embedding;
}
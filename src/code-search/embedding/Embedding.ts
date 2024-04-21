export type Embedding = number[];

export interface EmbeddingItem {
	embedding: Embedding;
}

export interface ScoredItem<T> {
	score: number;
	item: T;
}
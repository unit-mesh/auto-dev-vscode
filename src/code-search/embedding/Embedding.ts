import { TextRange } from "../semantic/model/TextRange";

export type Embedding = number[];

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
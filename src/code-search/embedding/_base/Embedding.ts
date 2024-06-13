import { TextRange } from '../../scope-graph/model/TextRange';

export type Embedding = number[];

export interface ScoredItem<T> {
	score: number;
	item: T;
}

export interface ChunkItem {
	/// file name with range
	name: string;
	/// path
	path: string;
	text: string;
	range: TextRange;
	embedding: Embedding;
	score?: number;
}

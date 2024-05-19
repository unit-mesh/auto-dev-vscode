import { TextRange } from "../../scope-graph/model/TextRange";
import { NamedElement } from "../../../editor/ast/NamedElement";

export type Embedding = number[];

export interface ScoredItem<T> {
	score: number;
	item: T;
}

export interface ChunkItem {
	name: string;
	file: string;
	text: string;
	range: TextRange;
	embedding: Embedding;
	score?: number;
}

// todo: add parse for named element
export interface NamedChunkItem {
	name: string;
	path: string;
	text: string;
	score: number;
	range: TextRange;
	nameElement: NamedElement;
	embedding: Embedding;
}
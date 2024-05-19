import { TextRange } from "../../scope-graph/model/TextRange";
import { NamedElement } from "../../../editor/ast/NamedElement";
import { ChunkItem, Embedding } from "./Embedding";

export interface NamedChunkItem {
	name: string;
	path: string;
	text: string;
	score: number;
	range: TextRange;
	nameElement: NamedElement;
	embedding: Embedding;
}

export class NamedChunk {
	static create(chunk: ChunkItem): NamedChunkItem[] {
		// get from end range ???
		return [];
	}
}
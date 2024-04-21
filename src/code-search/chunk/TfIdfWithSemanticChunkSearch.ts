import natural, { TfIdf } from "natural";

import { SemanticSearch } from "../chunk-strategy/ChunkSearchStrategy";

export class TfIdfWithSemanticChunkSearch extends SemanticSearch {
	private tfidf: TfIdf;

	constructor() {
		super();
		this.tfidf = new natural.TfIdf();
	}

	async isAvailable() {
		throw new Error("Method not implemented.");
	}

	async toSemanticChunks(similarFiles: string[], currentFile: string) {
		throw new Error("Method not implemented.");
	}
}
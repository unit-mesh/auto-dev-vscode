import { SemanticSearch } from "./ChunkSearchStrategy";

export class TfIdfWithSemanticChunkSearch extends SemanticSearch {
		async isAvailable() {
				throw new Error("Method not implemented.");
		}

		async toSemanticChunks(similarFiles: string[], currentFile: string) {
				throw new Error("Method not implemented.");
		}
}
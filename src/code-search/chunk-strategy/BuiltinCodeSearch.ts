import { SemanticSearch } from "./ChunkSearchStrategy";

export class BuiltinCodeSearch extends SemanticSearch {
	async toSemanticChunks(similarFiles: string[], currentFile: string) {
		throw new Error("Method not implemented.");
	}
}
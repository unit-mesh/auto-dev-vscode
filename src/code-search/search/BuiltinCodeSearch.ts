import { SemanticSearch } from "./SemanticSearch";

export class BuiltinCodeSearch extends SemanticSearch {
	async toChunks(similarFiles: string[], currentFile: string) {
		throw new Error("Method not implemented.");
	}
}
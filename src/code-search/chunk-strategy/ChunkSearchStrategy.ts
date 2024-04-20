export class SemanticSearch {
	async isAvailable () {
		throw new Error("Method not implemented.");
	}

	async toSemanticChunks(similarFiles: string[], currentFile: string) {
		throw new Error("Method not implemented.");
	}
}

export class CodeSearch extends SemanticSearch {
	searchFileChunks() {

	}

	async toSemanticChunks(similarFiles: string[], currentFile: string) {
		throw new Error("Method not implemented.");
	}
}
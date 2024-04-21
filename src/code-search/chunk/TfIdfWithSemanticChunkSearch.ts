import natural, { TfIdf } from "natural";

import { SemanticSearch } from "../chunk-strategy/ChunkSearchStrategy";
import { CancellationToken } from "vscode";

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

function withCancellation<T>(promise: Promise<T>, cancellationToken: CancellationToken, result: T): Promise<T> {
	return new Promise<T>((resolve, reject) => {
		const cancellationListener = cancellationToken.onCancellationRequested(() => {
			cancellationListener.dispose();
			resolve(result);
		});
		promise.then(resolve, reject).finally(() => cancellationListener.dispose());
	});
}

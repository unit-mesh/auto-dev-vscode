import natural, { TfIdf } from "natural";

import { SemanticSearch } from "../chunk-strategy/ChunkSearchStrategy";
import { CancellationToken } from "vscode";
import { TfIdfCallback } from "natural/lib/natural/tfidf";

/**
 * we use Natural's TfIdf to calculate the similarity between two code chunks.
 *
 * DOCS:
 * - https://naturalnode.github.io/natural/tfidf.html
 */
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

	addDocument(doc: string) {
		this.tfidf.addDocument(doc);
	}

	search(query: string, callback?: TfIdfCallback) {
		const results = this.tfidf.tfidfs(query, callback);
		return results;
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

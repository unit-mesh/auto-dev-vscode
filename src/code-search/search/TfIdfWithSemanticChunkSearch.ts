import natural, { TfIdf } from "natural";

import { SemanticSearch } from "./SemanticSearch";
import { CancellationToken } from "vscode";
import { TfIdfCallback } from "natural/lib/natural/tfidf";
import { Embedding } from "../embedding/_base/Embedding";

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

	addDocument(chunks: string[]) {
		chunks.forEach(chunk => {
			this.tfidf.addDocument(chunk);
		});
	}

	search(query: string, callback?: TfIdfCallback) {
		const results = this.tfidf.tfidfs(query, callback);
		return results;
	}

	computeEmbeddings(chunk: string): Embedding[] {
		const termFreq = this.calculateTermFrequencies(chunk);
		return this.computeTfidf(termFreq);
	}

	calculateTermFrequencies(chunk: string): Record<string, number> {
		return {};
	}

	computeTfidf(termFreq: Record<string, number>) {
		return [];
	}
}


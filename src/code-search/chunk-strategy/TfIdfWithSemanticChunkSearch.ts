import natural, { TfIdf } from "natural";

import { SemanticSearch } from "./SemanticSearch";
import { CancellationToken } from "vscode";
import { TfIdfCallback } from "natural/lib/natural/tfidf";
import { ChunkItem, Embedding, ScoredItem } from "../embedding/_base/Embedding";

/**
 * we use Natural's TfIdf to calculate the similarity between two code chunks.
 *
 * DOCS:
 * - https://naturalnode.github.io/natural/tfidf.html
 */
export class TfIdfWithSemanticChunkSearch extends SemanticSearch {
	private tfidf: TfIdf;
	_embeddingsMemoryCache: Map<String, Embedding> = new Map;

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

	async getEmbeddings(chunks: ChunkItem[], cancelToken: CancellationToken) {
		const chunksToCompute = [];

		// Check if embeddings are available in cache, otherwise add to compute list
		for (const chunk of chunks) {
			const embedding = this._embeddingsMemoryCache.get(chunk.text);
			if (embedding) {
				chunk.embedding = embedding;
			} else {
				chunksToCompute.push(chunk);
			}
		}

		// If all embeddings are in cache, return chunks
		if (chunksToCompute.length === 0) {
			return chunks;
		}

		// Compute embeddings for chunks not in cache
		const embeddingsToCompute = chunksToCompute.map(chunk => {
			// const embedding = $h(accessor, chunk.file);
			// return UKe(chunk, embedding);
			return chunk;
		});

		const computedEmbeddings = await this.computeEmbeddingsWithRetry(embeddingsToCompute, cancelToken);

		// Update cache and chunk objects with computed embeddings
		for (let i = 0; i < chunksToCompute.length; i++) {
			const chunk = chunksToCompute[i];
			const computedEmbedding = computedEmbeddings[i];
			chunk.embedding = computedEmbedding;
			this._embeddingsMemoryCache.set(chunk.text, computedEmbedding);
		}

		return chunks;
	}

	private async computeEmbeddingsWithRetry(embeddingsToCompute: any[], cancelToken: CancellationToken) {
		return [];
	}

	computeEmbeddings(chunk: string) : Embedding[] {
		const termFreq = this.calculateTermFrequencies(chunk);
		return this.computeTfidf(termFreq);
	}

	calculateTermFrequencies(chunk: string) : Record<string, number> {
		// return this.generateTermFrequencyMap(this.splitTerms(chunk));
		return {};
	}

	computeTfidf(termFreq: Record<string, number>) {
		// return this.tfidf.tfidf(termFreq);
		return [];
	}
}

export function withCancellation<T>(promise: Promise<T>, cancellationToken: CancellationToken, result: T): Promise<T> {
	return new Promise<T>((resolve, reject) => {
		const cancellationListener = cancellationToken.onCancellationRequested(() => {
			cancellationListener.dispose();
			resolve(result);
		});
		promise.then(resolve, reject).finally(() => cancellationListener.dispose());
	});
}

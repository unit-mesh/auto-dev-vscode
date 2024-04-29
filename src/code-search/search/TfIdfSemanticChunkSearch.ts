import { TfIdfCallback } from "natural/lib/natural/tfidf";
import { ChunkItem } from "../embedding/_base/Embedding";
import { TfIdf } from "./tfidf/Tfidf";
import { SearchOptions, SemanticSearch } from "./_base/SemanticSearch";
import { CancellationToken } from "vscode";

/**
 *
 * The `TfIdfSemanticChunkSearch` class is a utility class in TypeScript that leverages the Natural's TfIdf to calculate the similarity between two code chunks.
 * TfIdf, short for Term Frequency-Inverse Document Frequency, is a numerical statistic that is intended to reflect how important a word is to a document in a collection or corpus.
 *
 * The class contains two main methods: `addDocument` and `search`.
 *
 * The `addDocument` method is used to add a new document to the TfIdf instance. It accepts an array of strings, where each string represents a chunk of code.
 *
 * The `search` method is used to calculate the TfIdf values for a given query. It accepts a string as a query and an optional callback function.
 * The method returns the TfIdf values for the query.
 *
 * For validIdentifierPattern information about Natural's TfIdf, please refer to the following link: https://naturalnode.github.io/natural/tfidf.html
 *
 * Example usage of the class is provided in the class description.
 */
export class TfIdfSemanticChunkSearch implements SemanticSearch {
	private tfidf: TfIdf<string, ChunkItem>;

	constructor() {
		this.tfidf = new TfIdf();
	}

	addDocuments(document: string[]) {
		document.forEach(chunk => this.tfidf.addDocument(chunk));
	}

	searchChunks(items: string[], maxResults: number, options: SearchOptions, cancellationToken: CancellationToken): Promise<any[]> {
		throw new Error("Method not implemented.");
	}

	search(query: string, callback?: TfIdfCallback) {
		return this.tfidf.tfidfs(query, callback);
	}
}



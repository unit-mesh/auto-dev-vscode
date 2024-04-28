import natural, { TfIdf } from "natural";
import { TfIdfCallback } from "natural/lib/natural/tfidf";
import { Uri } from "vscode";

/**
 * // todo: spike for customize tfidf from: https://github.com/NaturalNode/natural/blob/master/lib/natural/tfidf/tfidf.js
 *
 * The `TfIdfWithSemanticChunkSearch` class is a utility class in TypeScript that leverages the Natural's TfIdf to calculate the similarity between two code chunks.
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
export class TfIdfWithSemanticChunkSearch {
	private tfidf: TfIdf;

	constructor() {
		this.tfidf = new natural.TfIdf();
	}

	addDocument(chunks: string[]) {
		chunks.forEach(chunk => {
			this.tfidf.addDocument(chunk);
		});
	}

	search(query: string, callback?: TfIdfCallback) {
		return this.tfidf.tfidfs(query, callback);
	}

	private static identifierPattern = /(?<![\p{Alphabetic}\p{Number}_$])[\p{Letter}_$][\p{Alphabetic}\p{Number}_$]{2,}(?![\p{Alphabetic}\p{Number}_$])/gu;
	private static camelCaseRegex = /(?<=[a-z$])(?=[A-Z])/g;
	private static numericRegex = /^(\D+)\p{Number}+$/u;
	private static validIdentifierPattern = /[\p{Alphabetic}_$]{3,}/gu;

	static* splitTerms(input: string) {
		const toLowerCase = (term: string) => term.toLowerCase();

		let namingMatch = input.matchAll(this.identifierPattern);
		for (let [term] of namingMatch) {
			let uniqueTerms = new Set();
			uniqueTerms.add(toLowerCase(term));

			let splitTerms = [];
			let camelCaseSplit = term.split(this.camelCaseRegex);
			if (camelCaseSplit.length > 1) {
				splitTerms.push(...camelCaseSplit);
			}

			let underscoreSplit = term.split('_');
			if (underscoreSplit.length > 1) {
				splitTerms.push(...underscoreSplit);
			}

			let numberSuffixMatch = term.match(this.numericRegex);
			if (numberSuffixMatch) {
				splitTerms.push(numberSuffixMatch[1]);
			}

			for (let splitTerm of splitTerms) {
				if (splitTerm.length > 2 && this.validIdentifierPattern.test(splitTerm)) {
					uniqueTerms.add(toLowerCase(splitTerm));
				}
			}

			yield* uniqueTerms;
		}
	}
}



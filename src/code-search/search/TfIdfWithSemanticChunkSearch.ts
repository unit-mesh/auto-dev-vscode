import natural, { TfIdf } from "natural";
import { TfIdfCallback } from "natural/lib/natural/tfidf";

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

	private static allPattern = /(?<![\p{Alphabetic}\p{Number}_$])[\p{Letter}_$][\p{Alphabetic}\p{Number}_$]{2,}(?![\p{Alphabetic}\p{Number}_$])/gu;
	private static camelCasePattern = /(?<=[a-z$])(?=[A-Z])/g;
	private static numericPattern = /^([\D]+)\p{Number}+$/u;

	/**
	 * The `splitTerms` method is a static generator function that splits the input string into terms based on the naming styl
	 * e of the identifiers. It supports three naming styles: CamelCase, Numeric, and underscore_case.
	 *
	 * @param input - The input string to be split into terms.
	 *
	 * The method works as follows:
	 * 1. It matches all patterns in the input string.
	 * 2. For each match, it creates a new set to store unique terms, and adds the lowercase version of the match to this set.
	 * 3. It then splits the match into terms based on the CamelCase, underscore_case, and Numeric naming styles, and adds these terms to the terms array.
	 * 4. If the term is longer than 2 characters and matches the alphabetic pattern, it is added to the set of unique terms.
	 * 5. Finally, it yields each unique term.
	 *
	 * Note: The method uses the `matchAll`, `split`, and `match` methods of the String object, and the `add`
	 * method of the Set object. It also uses the spread operator (...) to add multiple elements to an array.
	 *
	 * @yield {String} - Yields each unique term.
	 *
	 * todo: add support for chinese characters??
	 */
	static* splitTerms(input: string) {
		let matchAll = input.matchAll(this.allPattern);
		for (let [match_] of matchAll) {
			let uniqueTerms: Set<String> = new Set();
			uniqueTerms.add(match_.toLowerCase());

			let terms = [];

			let camelCaseSplits = match_.split(this.camelCasePattern);
			if(camelCaseSplits.length > 1) {
				terms.push(...camelCaseSplits);
			}

			let underscoreSplit = match_.split('_');
			if (underscoreSplit.length > 1) {
				terms.push(...underscoreSplit);
			}

			let numberSuffixMatch = match_.match(this.numericPattern);
			numberSuffixMatch && terms.push(numberSuffixMatch[1]);

			for (let term of terms) {
				if (term.length > 2 && /[\p{Alphabetic}_$]{3,}/gu.test(term)) {
					uniqueTerms.add(term.toLowerCase());
				}
			}

			yield* uniqueTerms;
		}
	}
}



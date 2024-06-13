import { StopwordsBasedTokenizer } from '../../tokenizer/StopwordsBasedTokenizer';

/**
 * Calculates the similarity score between a given path and a set of strings.
 *
 * @param path The path to calculate similarity for.
 * @param sets The set of strings to compare with the path.
 * @returns A number representing the similarity score between the path and the set of strings.
 */
export class JaccardSimilarity {
	/**
	 * The `tokenLevelJaccardSimilarity` method calculates the Jaccard similarity between a query string and an array of string
	 * arrays (chunks). The Jaccard similarity is a measure of the similarity between two sets and is defined as the size of
	 * the intersection divided by the size of the union of the two sets.
	 *
	 */
	public tokenLevelJaccardSimilarity(query: string, chunks: string[][]): number[][] {
		const currentFileTokens: Set<string> = new Set(this.tokenize(query));
		return chunks.map(list => {
			return list.map(it => {
				const tokenizedFile: Set<string> = new Set(this.tokenize(it));
				return this.similarityScore(currentFileTokens, tokenizedFile);
			});
		});
	}

	private tokenize(input: string): Set<string> {
		return StopwordsBasedTokenizer.instance().tokenize(input);
	}

	private similarityScore(set1: Set<string>, set2: Set<string>): number {
		const intersectionSize: number = [...set1].filter(x => set2.has(x)).length;
		const unionSize: number = new Set([...set1, ...set2]).size;
		return intersectionSize / unionSize;
	}

	/**
	 * Calculates the similarity score between a given path and a set of strings.
	 *
	 * @param path The path to calculate similarity for.
	 * @param sets The set of strings to compare with the path.
	 * @returns A number representing the similarity score between the path and the set of strings.
	 */
	public pathSimilarity(path: string, sets: Set<string>): number {
		const splitPath = path.split('/');
		const set1 = splitPath
			.map(it => this.tokenize(it))
			.reduce((acc, it) => new Set([...acc, ...it]), new Set<string>());

		/// tokenize for sets too
		const set2 = Array.from(sets)
			.map(it => this.tokenize(it))
			.reduce((acc, it) => new Set([...acc, ...it]), new Set<string>());

		return this.similarityScore(set1, set2);
	}
}

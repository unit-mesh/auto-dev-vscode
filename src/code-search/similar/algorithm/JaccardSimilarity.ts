import { StopwordsBasedTokenizer } from "../../tokenizer/StopwordsBasedTokenizer";

/**
 * `JaccardSimilarity` is a TypeScript class that provides methods to calculate the Jaccard similarity between strings.
 * Jaccard similarity is a measure of the similarity between two sets and is defined as the size of the intersection
 * divided by the size of the union of the two sets.
 *
 * @export
 * @class JaccardSimilarity
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
}
import { SimilarChunkTokenizer } from "../SimilarChunkTokenizer";

export class JaccardSimilarity {
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
		return SimilarChunkTokenizer.instance().tokenize(input);
	}

	private similarityScore(set1: Set<string>, set2: Set<string>): number {
		const intersectionSize: number = [...set1].filter(x => set2.has(x)).length;
		const unionSize: number = new Set([...set1, ...set2]).size;
		return intersectionSize / unionSize;
	}
}
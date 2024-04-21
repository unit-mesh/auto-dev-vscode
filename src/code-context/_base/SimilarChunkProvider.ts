export class SimilarChunkProvider {
	calculate(chunk: string): string[] {
		return [];
	}

	similarityScore(set1: Set<string>, set2: Set<string>): number {
		const intersectionSize: number = new Set([...set1].filter(x => set2.has(x))).size;
		const unionSize: number = new Set([...set1, ...set2]).size;
		return intersectionSize / unionSize;
	}


	/**
	 * The Default GitHub Copilot implementation of the similarity score function.
	 * Link to: https://github.com/mengjian-github/copilot-analysis
	 * Todo: compare to our implementation which is in the `similarityScore` function.
	 */
	similarityScoreCopilot(set1: Set<string>, set2: Set<string>): number {
		const intersection = new Set([...set1].filter(element => set2.has(element)));
		const intersectionSize = intersection.size;
		const unionSize = set1.size + set2.size - intersectionSize;
		return intersectionSize / unionSize;
	}

	/**
	 * GitHub Copilot Chatbot implementation of the cosine similarity function.
	 */
	cosineSimilarity(vector1: number[], vector2: number[]): number {
		let dotProduct = vector1.reduce((acc, val, idx) => acc + val * vector2[idx], 0);
		let magnitude1 = Math.sqrt(vector1.reduce((acc, val) => acc + val * val, 0));
		let magnitude2 = Math.sqrt(vector2.reduce((acc, val) => acc + val * val, 0));
		return dotProduct / (magnitude1 * magnitude2);
	}

}
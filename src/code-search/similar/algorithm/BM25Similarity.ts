import { TokenizedSimilarity } from "./TokenizedSimilarity";

class BM25Similarity extends TokenizedSimilarity {
	private k1: number;
	private b: number;
	private idfCache: Map<string, number>;

	constructor(k1: number = 1.5, b: number = 0.75) {
		super();
		this.k1 = k1;
		this.b = b;
		this.idfCache = new Map();
	}

	private computeIDF(chunks: Array<Array<string>>): void {
		const documentCount = chunks.length;
		const docFreq: Map<string, number> = new Map();

		for (const chunk of chunks) {
			const seen = new Set<string>();
			for (const doc of chunk) {
				const tokens = this.tokenize(doc);
				for (const token of tokens) {
					if (!seen.has(token)) {
						seen.add(token);
						docFreq.set(token, (docFreq.get(token) || 0) + 1);
					}
				}
			}
		}

		for (const [term, freq] of docFreq) {
			this.idfCache.set(term, Math.log(1 + (documentCount - freq + 0.5) / (freq + 0.5)));
		}
	}

	private computeBM25(queryTokens: Set<string>, docTokens: Set<string>, docLength: number, avgDocLength: number): number {
		let score = 0;
		for (const token of queryTokens) {
			if (docTokens.has(token)) {
				const idf = this.idfCache.get(token) || 0;
				const termFreq = Array.from(docTokens).filter(t => t === token).length;
				score += idf * ((termFreq * (this.k1 + 1)) / (termFreq + this.k1 * (1 - this.b + this.b * (docLength / avgDocLength))));
			}
		}
		return score;
	}

	computeInputSimilarity(query: string, chunks: Array<Array<string>>): Array<Array<number>> {
		const queryTokens = this.tokenize(query);
		const scores: Array<Array<number>> = [];
		const docLengths: Array<number> = [];
		let totalDocLength = 0;

		for (const chunk of chunks) {
			for (const doc of chunk) {
				const docTokens = this.tokenize(doc);
				const docLength = docTokens.size;
				docLengths.push(docLength);
				totalDocLength += docLength;
			}
		}

		const avgDocLength = totalDocLength / docLengths.length;
		this.computeIDF(chunks);

		for (const chunk of chunks) {
			const chunkScores: Array<number> = [];
			for (const doc of chunk) {
				const docTokens = this.tokenize(doc);
				const docLength = docTokens.size;
				const score = this.computeBM25(queryTokens, docTokens, docLength, avgDocLength);
				chunkScores.push(score);
			}
			scores.push(chunkScores);
		}

		return scores;
	}
}

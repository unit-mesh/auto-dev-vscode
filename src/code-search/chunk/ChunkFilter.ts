import { Embedding, ScoredItem } from "../embedding/Embedding";
import { EmbeddingProvider } from "../embedding/EmbeddingProvider";

const DEFAULT_THRESHOLD = 0.72;

export class ChunkFilter {
	static filterAndSortByScore<T extends EmbeddingProvider>(embeddings: Embedding[], items: T[], limit: number, minThreshold: number = DEFAULT_THRESHOLD): T[] {
		return items.flatMap((item: T) => {
			let maxScore: number = 0;
			for (let embedding of embeddings) {
				let score: number = item.embedding.reduce((total: number, value: number, index: number) => total + value * embedding[index], 0);
				maxScore = Math.max(maxScore, score);
			}
			return { score: maxScore, item: item } as ScoredItem<T>;
		}).filter((scoredItem: ScoredItem<T>) => scoredItem.score > minThreshold)
			.sort((a: ScoredItem<T>, b: ScoredItem<T>) => b.score - a.score)
			.slice(0, limit)
			.map((scoredItem: ScoredItem<T>) => scoredItem.item);
	}

}
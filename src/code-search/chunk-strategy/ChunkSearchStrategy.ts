import { CancellationToken } from "vscode";

const DEFAULT_THRESHOLD = 0.72;

export interface EmbeddingItem {
	embedding: number[];
}

interface ScoredItem<T> {
	score: number;
	item: T;
}

function filterAndSortByScore<T extends EmbeddingItem>(embeddings: number[][], items: T[], limit: number, minThreshold: number = DEFAULT_THRESHOLD): T[] {
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

export class SemanticSearch {
	async isAvailable() {
		throw new Error("Method not implemented.");
	}

	async toSemanticChunks(similarFiles: string[], currentFile: string) {
		throw new Error("Method not implemented.");
	}

	/**
	 * 搜索相似代码块
	 * @param {string} text - 要搜索的文本。
	 * @param {number} maxResults - 最大结果数。
	 * @param {object} options - 搜索选项对象。
	 * @param {boolean} options.include - 是否包含指定的内容。
	 * @param {object} cancellationToken - 用于取消操作的信号对象。
	 * @returns {Promise<Array>} - 返回搜索结果的数组。
	 */
	async searchFileChunks(text: string, maxResults: number, options: any, cancellationToken: CancellationToken) {
		// 实现搜索逻辑
	}
}

export class CodeSearch extends SemanticSearch {
	async toSemanticChunks(similarFiles: string[], currentFile: string) {
		throw new Error("Method not implemented.");
	}
}
import { CancellationToken } from "vscode";

const DEFAULT_THRESHOLD = 0.72;

interface Item {
	embedding: number[];
}

interface ScoredItem {
	score: number;
	item: Item;
}

function calculateTopElement(
	targets: number[][],
	items: Item[],
	count: number,
	threshold: number = DEFAULT_THRESHOLD
): Item[] {
	return items
		.flatMap(item => {
			let maxScore = 0;
			for (const target of targets) {
				let score = item.embedding.reduce((acc, val, index) => acc + val * target[index], 0);
				maxScore = Math.max(maxScore, score);
			}
			return { score: maxScore, item };
		})
		.filter(scoredItem => scoredItem.score > threshold)
		.sort((a: ScoredItem, b: ScoredItem) => b.score - a.score)
		.slice(0, count)
		.map(scoredItem => scoredItem.item);
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
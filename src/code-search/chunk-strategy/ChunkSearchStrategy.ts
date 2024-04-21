import { CancellationToken } from "vscode";

export class SemanticSearch {
	async isAvailable() {
		throw new Error("Method not implemented.");
	}

	async toSemanticChunks(similarFiles: string[], currentFile: string) {
		throw new Error("Method not implemented.");
	}

	/**
	 * 搜索相似代码块
	 * @param {string[]} items - 要搜索的文本，例如 `keyword`，。
	 * @param {number} maxResults - 最大结果数。
	 * @param {object} options - 搜索选项对象。
	 * @param {boolean} options.include - 是否包含指定的内容，诸如于路径、文件名等。
	 * @param {object} cancellationToken - 用于取消操作的信号对象。
	 * @returns {Promise<Array>} - 返回搜索结果的数组。
	 */
	async searchFileChunks(items: string, maxResults: number, options: any, cancellationToken: CancellationToken) {
		// 实现搜索逻辑
	}
}

export class CodeSearch extends SemanticSearch {
	async toSemanticChunks(similarFiles: string[], currentFile: string) {
		throw new Error("Method not implemented.");
	}
}
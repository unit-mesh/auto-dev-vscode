import { CancellationToken } from 'vscode';

import { SearchOptions } from './SearchOptions';

export interface SemanticSearch {
	/**
	 * 搜索相似代码块
	 * @param {string[]} items - 要搜索的文本，例如 `keyword`，。
	 * @param {number} maxResults - 最大结果数。
	 * @param {object} options - 搜索选项对象。
	 * @param {boolean} options.include - 是否包含指定的内容，诸如于路径、文件名等。
	 * @param {object} cancellationToken - 用于取消操作的信号对象。
	 * @returns {Promise<Array>} - 返回搜索结果的数组。
	 */
	searchChunks(
		items: string[],
		maxResults: number,
		options: SearchOptions,
		cancellationToken: CancellationToken,
	): Promise<Array<any>>;
}

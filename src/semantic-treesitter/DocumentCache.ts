import { TreeSitterFile } from "./TreeSitterFile";

export interface DocumentKey {
	uri: string;
	version: number;
}

export class TreeSitterFileCache {
	private cache: Map<string, Map<number, TreeSitterFile>>;

	constructor() {
		this.cache = new Map<string, Map<number, TreeSitterFile>>();
	}

	// 将 TreeSitterFile 存储到缓存中
	public setDocument(uri: string, version: number, file: TreeSitterFile): void {
		// const key: DocumentKey = { uri, version };
		if (!this.cache.has(uri)) {
			this.cache.set(uri, new Map<number, TreeSitterFile>());
		}
		this.cache.get(uri)!.set(version, file);
	}

	// 从缓存中获取 TreeSitterFile
	public getDocument(uri: string, version: number): TreeSitterFile | undefined {
		const versionMap = this.cache.get(uri);
		if (versionMap) {
			return versionMap.get(version);
		}
		return undefined;
	}

	// 清空缓存
	public clearCache(): void {
		this.cache.clear();
	}
}

import { Uri } from "vscode";

import { TreeSitterFile } from "../../code-context/ast/TreeSitterFile";
import { FileCacheManger } from "./FileCacheManger";

export class TreeSitterFileCacheManager implements FileCacheManger<TreeSitterFile> {
	private static instance: TreeSitterFileCacheManager;

	public static getInstance(): TreeSitterFileCacheManager {
		if (!TreeSitterFileCacheManager.instance) {
			TreeSitterFileCacheManager.instance = new TreeSitterFileCacheManager();
		}

		return TreeSitterFileCacheManager.instance;
	}

	private cache: Map<Uri, Map<number, TreeSitterFile>>;

	constructor() {
		this.cache = new Map<Uri, Map<number, TreeSitterFile>>();
	}

	public setDocument(uri: Uri, version: number, file: TreeSitterFile): void {
		if (!this.cache.has(uri)) {
			this.cache.set(uri, new Map<number, TreeSitterFile>());
		} else {
			this.cache.get(uri)!.set(version, file);
		}
	}

	/**
	 * If you want to get doc with cache, please use `documentToTreeSitterFile` instead
	 * @param uri
	 * @param version
	 */
	public getDocument(uri: Uri, version: number): TreeSitterFile | undefined {
		const versionMap = this.cache.get(uri);
		if (versionMap) {
			return versionMap.get(version);
		}

		return undefined;
	}

	public clearCache(): void {
		this.cache.clear();
	}
}

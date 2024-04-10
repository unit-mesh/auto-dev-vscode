import { Uri } from "vscode";
import { CodeFile } from "../model/program";
import { FileCacheManger } from "./FileCacheManger";

export class CodeFileCacheManager implements FileCacheManger <CodeFile> {
	private cache: Map<Uri, Map<number, CodeFile>>;

	constructor() {
		this.cache = new Map<Uri, Map<number, CodeFile>>();
	}

	// 将 TreeSitterFile 存储到缓存中
	public setDocument(uri: Uri, version: number, file: CodeFile): void {
		if (!this.cache.has(uri)) {
			this.cache.set(uri, new Map<number, CodeFile>());
		} else {
			this.cache.get(uri)!.set(version, file);
		}
	}

	// 从缓存中获取 TreeSitterFile
	public getDocument(uri: Uri, version: number): CodeFile | undefined {
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

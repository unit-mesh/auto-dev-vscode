import { Uri } from "vscode";
import { FileCacheManger } from "./FileCacheManger";
import { CodeFile, CodeStructure } from "../codemodel/CodeFile";

export class CodeFileCacheManager implements FileCacheManger <CodeFile> {
	private documentMap: Map<Uri, Map<number, CodeFile>>;
	private canonicalNameMap: Map<string, CodeStructure>;

	constructor() {
		this.documentMap = new Map<Uri, Map<number, CodeFile>>();
		this.canonicalNameMap = new Map<string, CodeStructure>();
	}

	// 将 TreeSitterFile 存储到缓存中
	public setDocument(uri: Uri, version: number, file: CodeFile): void {
		if (!this.documentMap.has(uri)) {
			this.documentMap.set(uri, new Map<number, CodeFile>());
		} else {
			this.documentMap.get(uri)!.set(version, file);
		}

		file.classes.forEach((value) => {
			this.canonicalNameMap.set(value.canonicalName, value);
		});
	}

	// 从缓存中获取 TreeSitterFile
	public getDocument(uri: Uri, version: number): CodeFile | undefined {
		const versionMap = this.documentMap.get(uri);
		if (versionMap) {
			return versionMap.get(version);
		}

		return undefined;
	}

	// 通过类名获取 CodeStructure
	public getStructureByCanonicalName(canonicalName: string): CodeStructure | undefined {
		return this.canonicalNameMap.get(canonicalName);
	}

	// get all canonicalNameMap
	public getCanonicalNameMap(): Map<string, CodeStructure> {
		return this.canonicalNameMap;
	}

	// 清空缓存
	public clearCache(): void {
		this.documentMap.clear();
	}
}

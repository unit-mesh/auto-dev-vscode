import vscode, { Uri } from "vscode";
import { FileCacheManger } from "./FileCacheManger";
import { CodeFile, CodeStructure } from "../codemodel/CodeFile";
import { SupportedLanguage } from "../language/SupportedLanguage";
import { EXT_LANGUAGE_MAP } from "../language/ExtLanguageMap";
import { JavaStructurer } from "../semantic/structurer/JavaStructurer";
import { StructurerProviderManager } from "../semantic/structurer/StructurerProviderManager";
import { channel } from "../channel";

export class CodeFileCacheManager implements FileCacheManger <CodeFile> {
	private documentMap: Map<Uri, Map<number, CodeFile>>;
	private canonicalNameMap: Map<string, CodeStructure>;
	private structureProvider: StructurerProviderManager;

	constructor(structureProvider: StructurerProviderManager) {
		this.documentMap = new Map<Uri, Map<number, CodeFile>>();
		this.canonicalNameMap = new Map<string, CodeStructure>();
		this.structureProvider = structureProvider;
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
	public getRecentlyStructure(canonicalName: string, lang: SupportedLanguage): CodeStructure | undefined {
		let structure = this.canonicalNameMap.get(canonicalName);
		if (structure !== undefined) {
			return structure;
		}

		let structurer = this.structureProvider.getStructurer(lang);
		if (structurer === undefined) {
			return undefined;
		}

		let textDocuments = vscode.workspace.textDocuments.filter((doc) => {
			const ext = doc.uri.path.split('.').pop();
			if (ext === undefined) {
				return false;
			}
			return EXT_LANGUAGE_MAP[ext] !== lang;
		});

		// let files = textDocuments.map(async (doc) => {
		// 	await structurer?.parseFile(doc.getText())
		// })

		channel.append(`TextDocuments: ${textDocuments.length}\n`)

		return undefined
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

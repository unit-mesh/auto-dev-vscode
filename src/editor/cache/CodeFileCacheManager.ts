import vscode, { Uri } from 'vscode';

import { inferLanguage, LanguageIdentifier } from 'base/common/languages/languages';

import { StructurerProvider } from '../../code-context/_base/StructurerProvider';
import { StructurerProviderManager } from '../../code-context/StructurerProviderManager';
import { CodeFile, CodeStructure } from '../codemodel/CodeElement';
import { FileCacheManger } from './FileCacheManger';

export class CodeFileCacheManager implements FileCacheManger<CodeFile> {
	private documentMap: Map<Uri, Map<number, CodeFile>>;
	private canonicalNameMap: Map<string, CodeStructure>;
	private structureProvider: StructurerProviderManager = StructurerProviderManager.getInstance();

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

		file.classes.forEach(value => {
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

	public async getRecentlyStructure(canonicalName: string, lang: LanguageIdentifier): Promise<CodeStructure> {
		let structure = this.canonicalNameMap.get(canonicalName);
		if (structure !== undefined) {
			return structure;
		}

		let structurer = this.structureProvider.getStructurer(lang);
		if (structurer === undefined) {
			return Promise.reject(`Unsupported language: ${lang}`);
		}

		let files = this.lookupFromRecently(lang, canonicalName, structurer);
		return files[0];
	}

	private lookupFromRecently(
		lang: string,
		canonicalName: string,
		structurer: StructurerProvider,
	): Promise<CodeStructure>[] {
		const textDocuments = vscode.workspace.textDocuments.filter(doc => {
			return inferLanguage(doc.uri.path) !== lang;
		});

		let codeStructures = textDocuments.map(async doc => {
			const cache = this.documentMap.get(doc.uri)?.get(doc.version);
			if (cache !== undefined) {
				return cache.classes.filter(value => value.canonicalName === canonicalName)[0];
			}

			let codeFile = await structurer?.parseFile(doc.getText(), doc.uri.path);
			if (codeFile === undefined) {
				return Promise.reject(`Failed to parse file: ${doc.uri}`);
			}

			this.setDocument(doc.uri, doc.version, codeFile);
			return codeFile.classes.filter(value => value.canonicalName === canonicalName)[0];
		});

		return codeStructures;
	}

	public clearCache(): void {
		this.documentMap.clear();
	}
}

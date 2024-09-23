import os from 'node:os';
import path from 'node:path';

import { inject, injectable } from 'inversify';
import _, { forEach } from 'lodash';
import { data } from 'node_modules/cheerio/dist/commonjs/api/attributes';
import { CodeSample } from 'src/action/AddCodeSample/AddCodeSampleExecutor';
import { FrameworkCodeFragment } from 'src/code-context/csharp/model/FrameworkCodeFragmentExtractor';
import { Disposable, type Event, EventEmitter, TextDocument, Uri, workspace } from 'vscode';

import { IExtensionContext } from '../configuration/context';
import WorkspaceSerializer from './WorkspaceSerializer';

type DocDealCallback = (document: TextDocument) => void;

@injectable()
export class WorkspaceService {
	protected readonly _disposables: Disposable[];
	private readonly _listenerMap: Map<DocDealCallback, Disposable>;
	private readonly _saveDataMap: Map<string, Map<string, IDataStorage[]>>;
	constructor(
		@inject(IExtensionContext)
		private readonly extensionContext: IExtensionContext,
	) {
		this._saveDataMap = new Map<string, Map<string, IDataStorage[]>>();
		this._disposables = [];
		this._disposables.push();
		this._listenerMap = new Map();

		workspace.onDidCloseTextDocument(document => {
			let language = document.languageId;
			let workspaceSerializer = new WorkspaceSerializer(document);
			if (this._saveDataMap.has(language)) {
				let languageDataStorageMap = this._saveDataMap.get(language);
				if (languageDataStorageMap != undefined) {
					let dataStorages = languageDataStorageMap.get('CodeSample');
					if (dataStorages != undefined) workspaceSerializer.saveObject(dataStorages, 'CodeSample', language);
					console.log('test');
				}
			}
			if (this._saveDataMap.has(language)) {
				let languageDataStorageMap = this._saveDataMap.get(language);
				if (languageDataStorageMap != undefined) {
					let dataStorages = languageDataStorageMap.get('FrameworkCodeFragment');
					if (dataStorages != undefined)
						workspaceSerializer.saveObject(dataStorages, 'FrameworkCodeFragment', language);
					console.log('test');
				}
			}
		});
		workspace.onDidOpenTextDocument(document => {
			let language = document.languageId;
			let workspaceSerializer = new WorkspaceSerializer(document);
			let codeSamples = workspaceSerializer.loadObject<CodeSample[]>(language, 'CodeSample');
			if (codeSamples != null) {
				if (this._saveDataMap.has(language)) {
					let languageDataStorageMap = this._saveDataMap.get(language);
					languageDataStorageMap?.set('CodeSample', codeSamples);
				} else {
					let languageDataStorageMap = new Map<string, IDataStorage[]>();
					languageDataStorageMap.set('CodeSample', codeSamples);
					this._saveDataMap.set(language, languageDataStorageMap);
				}
			}
			let frameworkCodeFragments = workspaceSerializer.loadObject<FrameworkCodeFragment[]>(
				language,
				'FrameworkCodeFragment',
			);
			if (frameworkCodeFragments != null) {
				if (this._saveDataMap.has(language)) {
					let languageDataStorageMap = this._saveDataMap.get(language);
					languageDataStorageMap?.set('FrameworkCodeFragment', frameworkCodeFragments);
				} else {
					let languageDataStorageMap = new Map<string, IDataStorage[]>();
					languageDataStorageMap.set('FrameworkCodeFragment', frameworkCodeFragments);
					this._saveDataMap.set(language, languageDataStorageMap);
				}
			}
		});
	}
	dispose(): void {
		Disposable.from(...this._disposables).dispose();
		this._disposables.length = 0;
		this._listenerMap.clear();
		this._saveDataMap.clear();
	}
	public AddOpenListener(method: DocDealCallback) {
		const disposable = workspace.onDidOpenTextDocument(document => {
			method(document);
		});
		this._disposables.push(disposable);
		this._listenerMap.set(method, disposable);
	}

	public RemoveOpenListener(method: DocDealCallback) {
		const disposable = this._listenerMap.get(method);
		if (disposable) {
			disposable.dispose();
			this._disposables.splice(this._disposables.indexOf(disposable), 1);
			this._listenerMap.delete(method);
		}
	}
	public AddCloseListener(method: DocDealCallback) {
		const disposable = workspace.onDidCloseTextDocument(document => {
			method(document);
		});
		this._disposables.push(disposable);
		this._listenerMap.set(method, disposable);
	}

	public RemoveCloseListener(method: DocDealCallback) {
		const disposable = this._listenerMap.get(method);
		if (disposable) {
			disposable.dispose();
			this._disposables.splice(this._disposables.indexOf(disposable), 1);
			this._listenerMap.delete(method);
		}
	}
	public AddDataStorage(language: string, dataStorage: IDataStorage) {
		let key = dataStorage.GetType();
		if (this._saveDataMap.has(language)) {
			let languageDataStorageMap = this._saveDataMap.get(language);
			if (languageDataStorageMap != undefined) {
				let dataStorages = languageDataStorageMap?.get(key);
				let dataEqualed = dataStorages?.filter(item => {
					return dataStorage.equals(item) == true;
				});
				if (dataEqualed != undefined) {
					if (dataEqualed.length > 0) return;
				}
				dataStorages?.push(dataStorage);
			} else {
				languageDataStorageMap = new Map<string, IDataStorage[]>();
				let dataStorages:IDataStorage[]=[]
				dataStorages.push(dataStorage)
				languageDataStorageMap.set(key,dataStorages);
			}
		} else {
			const dataStorages: IDataStorage[] = [];
			dataStorages.push(dataStorage);
			let dataDataStorageMap = new Map<string, IDataStorage[]>();
			dataDataStorageMap.set(key, dataStorages);
			this._saveDataMap.set(language, dataDataStorageMap);
		}
	}
	public GetDataStorage(language: string, key: string): IDataStorage[] | undefined {
		let dataDataStorageMap = this._saveDataMap.get(language);
		if (dataDataStorageMap) {
			let datas = dataDataStorageMap.get(key);
			return datas;
		} else {
			return undefined;
		}
	}
	public RemoveDataStorage(language: string, key: string, dataStorage: IDataStorage) {
		if (!this._saveDataMap.has(language)) return;
		let languageDataStorageMap = this._saveDataMap.get(language);
		let dataStorages = languageDataStorageMap?.get(key);
		let newData = dataStorages?.reduce((acc, item) => {
			if (dataStorage.equals(item) !== false) {
				acc.push(item);
			}
			return acc;
		}, [] as IDataStorage[]);
		if (newData) languageDataStorageMap?.set(key, newData);
	}
}

export interface IDataStorage {
	Save(): void;
	Load(): void;
	GetType(): string;
	equals(t: IDataStorage): boolean;
}

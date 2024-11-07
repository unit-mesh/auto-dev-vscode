import os from 'node:os';
import path from 'node:path';

import { inject, injectable } from 'inversify';
import _, { difference, forEach } from 'lodash';
import { data } from 'node_modules/cheerio/dist/commonjs/api/attributes';
import { CodeSample } from 'src/action/addCodeSample/AddCodeSampleExecutor';
import { AutoDevExtension } from 'src/AutoDevExtension';
import { FrameworkCodeFragment } from 'src/code-context/_base/LanguageModel/ClassElement/FrameworkCodeFragmentExtractorBase';
import { Service } from 'src/service/Service';
import vscode from 'vscode';
import { Disposable, type Event, EventEmitter, TextDocument, Uri, workspace } from 'vscode';
import { SyntaxNode } from 'web-tree-sitter';

import { IExtensionContext } from '../configuration/context';
import WorkspaceSerializer from './WorkspaceSerializer';
import { WorkspaceSqlManager } from './WorkspaceSqlManager';

type DocDealCallback = (document: TextDocument) => void;

@injectable()
export class WorkspaceService implements Service {
	private _sqlManager:WorkspaceSqlManager|undefined;
	protected readonly _disposables: Disposable[];
	private readonly _listenerMap: Map<DocDealCallback, Disposable>;
	private readonly _saveDataMap: Map<string, Map<string, IDataStorage[]>>;
	private _autodev: AutoDevExtension|null = null;
	constructor() {
		this._saveDataMap = new Map<string, Map<string, IDataStorage[]>>();
		this._disposables = [];
		this._disposables.push();
		this._listenerMap = new Map();
		const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
		if (workspaceFolder) {
			const fileDir=path.join(workspaceFolder.uri.fsPath, '.vscode', `WorkspaceService.db`);
			this._sqlManager=new WorkspaceSqlManager(fileDir);
		}


		workspace.onDidCloseTextDocument(document => {
			let language = document.languageId;
			let workspaceSerializer = new WorkspaceSerializer(document);
			if (this._saveDataMap.has(language)) {
				let languageDataStorageMap = this._saveDataMap.get(language);
				if (languageDataStorageMap != undefined) {
					let dataStorages = languageDataStorageMap.get('CodeSample');
					if (dataStorages != undefined) workspaceSerializer.saveObject(dataStorages, 'CodeSample', language);
				}
			}
			if (this._saveDataMap.has(language)) {
				let languageDataStorageMap = this._saveDataMap.get(language);
				if (languageDataStorageMap != undefined) {
					let dataStorages = languageDataStorageMap.get('FrameworkCodeFragment');
					if (dataStorages != undefined)
						workspaceSerializer.saveObject(dataStorages, 'FrameworkCodeFragment', language);
				}
			}
		});
		vscode.window.onDidChangeActiveTextEditor(editor => {
			if (editor) {
				let document = editor.document;
				let language = document.languageId;
				let workspaceSerializer = new WorkspaceSerializer(document);
				if (this._saveDataMap.has(language)) {
					let languageDataStorageMap = this._saveDataMap.get(language);
					if (languageDataStorageMap != undefined) {
						let dataStorages = languageDataStorageMap.get('CodeSample');
						if (dataStorages != undefined) workspaceSerializer.saveObject(dataStorages, 'CodeSample', language);
					}
				}
				if (this._saveDataMap.has(language)) {
					let languageDataStorageMap = this._saveDataMap.get(language);
					if (languageDataStorageMap != undefined) {
						let dataStorages = languageDataStorageMap.get('FrameworkCodeFragment');
						if (dataStorages != undefined)
							workspaceSerializer.saveObject(dataStorages, 'FrameworkCodeFragment', language);
					}
				}

				this._saveDataMap.clear();
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

				vscode.commands.executeCommand('vscode.executeCodeLensProvider', document.uri);
			}
		});
		vscode.workspace.onDidSaveTextDocument(document => {
			let language = document.languageId;
			let workspaceSerializer = new WorkspaceSerializer(document);
			if (this._saveDataMap.has(language)) {
				let languageDataStorageMap = this._saveDataMap.get(language);
				if (languageDataStorageMap != undefined) {
					let dataStorages = languageDataStorageMap.get('CodeSample');
					if (dataStorages != undefined) workspaceSerializer.saveObject(dataStorages, 'CodeSample', language);
				}
			}
			if (this._saveDataMap.has(language)) {
				let languageDataStorageMap = this._saveDataMap.get(language);
				if (languageDataStorageMap != undefined) {
					let dataStorages = languageDataStorageMap.get('FrameworkCodeFragment');
					if (dataStorages != undefined)
						workspaceSerializer.saveObject(dataStorages, 'FrameworkCodeFragment', language);
				}
			}
			vscode.commands.executeCommand('vscode.executeCodeLensProvider', document.uri);
		});
		vscode.workspace.onDidOpenTextDocument(documentA => {
			let editor = vscode.window.activeTextEditor;
			if (editor == undefined) return;
			let document = editor.document;
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
			vscode.commands.executeCommand('vscode.executeCodeLensProvider', document.uri);
		});
	}
	public BindAutoDevExtension(autodev: AutoDevExtension) {
		this._autodev = autodev;
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
				if (dataStorages != undefined) {
					let dataEqualed = dataStorages?.filter(item => {
						return dataStorage.equals(item) == true;
					});
					if (dataEqualed != undefined) {
						if (dataEqualed.length > 0) return;
					}
					dataStorages.push(dataStorage);
					let dataDataStorageMap = new Map<string, IDataStorage[]>();
					dataDataStorageMap.set(key, dataStorages);
					for (const [key, value] of languageDataStorageMap) {
						dataDataStorageMap.set(key, value);
					}
					this._saveDataMap.set(language, dataDataStorageMap);
				} else {
					dataStorages = [];
					dataStorages.push(dataStorage);
					languageDataStorageMap.set(key, dataStorages);
				}
			} else {
				languageDataStorageMap = new Map<string, IDataStorage[]>();
				let dataStorages: IDataStorage[] = [];
				dataStorages.push(dataStorage);
				languageDataStorageMap.set(key, dataStorages);
			}
		} else {
			const dataStorages: IDataStorage[] = [];
			dataStorages.push(dataStorage);
			let dataDataStorageMap = new Map<string, IDataStorage[]>();
			dataDataStorageMap.set(key, dataStorages);
			let temp = this._saveDataMap.get(language);
			if (temp != undefined) {
				for (const [key, value] of temp) {
					dataDataStorageMap.set(key, value);
				}
			}

			this._saveDataMap.set(language, dataDataStorageMap);
		}
		let editor = vscode.window.activeTextEditor;
		if (editor) {
			let document = editor.document;
			vscode.commands.executeCommand('vscode.executeCodeLensProvider', document.uri);
		}
		this._autodev?.chat.send('WorkspaceService_AddDataStorage',"test");
	}
	public RemoveDataStorage(language: string, dataStorage: IDataStorage) {
		if (!this._saveDataMap.has(language)) {
			return;
		} else {
			let key = dataStorage.GetType();
			if (this._saveDataMap.has(language)) {
				let languageDataStorageMap = this._saveDataMap.get(language);
				if (languageDataStorageMap != undefined) {
					let dataStorages = languageDataStorageMap?.get(key);
					let datasNotEqualed = dataStorages?.filter(item => {
						return dataStorage.equals(item) == false;
					});
					if (datasNotEqualed != undefined && dataStorages != undefined) {
						languageDataStorageMap.set(key, datasNotEqualed);
					}
				}
			}
		}
		let editor = vscode.window.activeTextEditor;
		if (editor) {
			let document = editor.document;
			vscode.commands.executeCommand('vscode.executeCodeLensProvider', document.uri);
		}
	}

	public ChangeDataStorage(language: string, key: string, ollDataStorage: IDataStorage, newDataStorage: IDataStorage) {
		if (!this._saveDataMap.has(language)) {
			return;
		} else {
			if (this._saveDataMap.has(language)) {
				let languageDataStorageMap = this._saveDataMap.get(language);
				if (languageDataStorageMap != undefined) {
					let dataStorages = languageDataStorageMap?.get(key);
					let dataEqualedIndex = dataStorages?.findIndex(item => {
						return ollDataStorage.equals(item) == true;
					});
					if (dataEqualedIndex != undefined && dataStorages != undefined) {
						dataStorages[dataEqualedIndex] = newDataStorage;
						languageDataStorageMap.set(key, dataStorages);
					}
				}
			}
		}
		let editor = vscode.window.activeTextEditor;
		if (editor) {
			let document = editor.document;
			vscode.commands.executeCommand('vscode.executeCodeLensProvider', document.uri);
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
	public HasDataStorage(language: string, dataStorage: IDataStorage): boolean {
		let key = dataStorage.GetType();
		if (this._saveDataMap.has(language)) {
			let languageDataStorageMap = this._saveDataMap.get(language);
			if (languageDataStorageMap != undefined) {
				let dataStorages = languageDataStorageMap?.get(key);
				let dataEqualed = dataStorages?.filter(item => {
					return dataStorage.equals(item) == true;
				});
				if (dataEqualed != undefined) {
					if (dataEqualed.length > 0) return true;
				}
			}
		}
		return false;
	}
}
export interface IDataStorage {
	GetType(): string;
	equals(t: IDataStorage): boolean;
}

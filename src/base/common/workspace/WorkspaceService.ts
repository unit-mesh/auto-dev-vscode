import os from 'node:os';
import path from 'node:path';

import { inject, injectable } from 'inversify';
import _, { difference, forEach } from 'lodash';
import { AutoDevExtension } from 'src/AutoDevExtension';
import { Service } from 'src/service/Service';
import vscode from 'vscode';
import { Disposable, type Event, EventEmitter, TextDocument, Uri, workspace } from 'vscode';
//import WorkspaceSerializer from './WorkspaceSerializer';
import { WorkspaceSqlManager } from './WorkspaceSqlManager';
import { DataStorageGroupManager } from './DataStorageGroupManager';

type DocDealCallback = (document: TextDocument) => void;

@injectable()
export class WorkspaceService implements Service {
    private _sqlManager: WorkspaceSqlManager | undefined;
    protected readonly _disposables: Disposable[];
    private readonly _listenerMap: Map<DocDealCallback, Disposable>;
		public readonly  DataStorageGroupManager:DataStorageGroupManager| undefined;
    /**
     * @type 用于存储项目中IDataStorage在数据库中的id
     */
    private readonly _saveDataIdMap: Map<string, Map<string, Set<number>>>;
    /**
     * @type 用于存储IDataStorage数据
     */
    private readonly _saveDataMap = new Map<string, Map<string, Map<number, IDataStorage>>>();
    private _autodev: AutoDevExtension | null = null;

    constructor() {
        this._saveDataIdMap = new Map<string, Map<string, Set<number>>>();
        this._saveDataMap = new Map<string, Map<string, Map<number, IDataStorage>>>();
        this._disposables = [];
        this._disposables.push();
        this._listenerMap = new Map();

        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (workspaceFolder) {
            const fileDir = path.join(workspaceFolder.uri.fsPath, '.vscode', `WorkspaceService.db`);
            this._sqlManager = new WorkspaceSqlManager(fileDir);
						this.DataStorageGroupManager=new DataStorageGroupManager(this._sqlManager);
        }

        workspace.onDidCloseTextDocument(document => {
            this.handleDocumentEvent(document);
        });

        vscode.window.onDidChangeActiveTextEditor(async editor => {
            if (editor) {
                await this.handleDocumentEvent(editor.document);
                await this.refreshDataStorageIds(editor.document);
            }
        });

        vscode.workspace.onDidSaveTextDocument(document => {
            this.handleDocumentEvent(document);
        });

        vscode.workspace.onDidOpenTextDocument(async document => {
            await this.refreshDataStorageIds(document);
        });

        // 监听编程语言切换事件
        vscode.window.onDidChangeActiveTextEditor(async editor => {
            if (editor) {
                await this.loadDataForLanguage(editor.document.languageId);
            }
        });
    }

    private async handleDocumentEvent(document: TextDocument) {
        // let language = document.languageId;
        // let workspaceSerializer = new WorkspaceSerializer(document);
        // if (this._saveDataIdMap.has(language)) {
        //     let languageDataStorageMap = this._saveDataIdMap.get(language);
        //     if (languageDataStorageMap != undefined) {
        //         let dataStorages = languageDataStorageMap.get('CodeSample');
        //         if (dataStorages != undefined) workspaceSerializer.saveObject(dataStorages, 'CodeSample', language);
        //     }
        // }
        // if (this._saveDataIdMap.has(language)) {
        //     let languageDataStorageMap = this._saveDataIdMap.get(language);
        //     if (languageDataStorageMap != undefined) {
        //         let dataStorages = languageDataStorageMap.get('FrameworkCodeFragment');
        //         if (dataStorages != undefined)
        //             workspaceSerializer.saveObject(dataStorages, 'FrameworkCodeFragment', language);
        //     }
        // }
    }

    private async refreshDataStorageIds(document: TextDocument) {
        let language = document.languageId;
				if (this._saveDataIdMap.has(language)) {
				  return ;
				}
        await this.loadDataForType(language, 'CodeSample');
        await this.loadDataForType(language, 'FrameworkCodeFragment');

        vscode.commands.executeCommand('vscode.executeCodeLensProvider', document.uri);
    }

    private async loadDataForLanguage(language: string) {
			if (this._saveDataIdMap.has(language)) {
				return ;
			}
return;
        await this.loadDataForType(language, 'CodeSample');
        await this.loadDataForType(language, 'FrameworkCodeFragment');
    }

    private async loadDataForType(language: string, type: string) {
        let ids = await this._sqlManager?.GetAllDataStorageIds(language, type);
        if (ids != null && ids.length > 0) {
            let languageDataStorageMap = this._saveDataIdMap.get(language) || new Map<string, Set<number>>();
            languageDataStorageMap.set(type, new Set(ids));
            this._saveDataIdMap.set(language, languageDataStorageMap);

            let dataMap = new Map<number, IDataStorage>();
            for (const id of ids) {
                let dataStorage = await this._sqlManager?.LoadDataStorage(language, type, id);
                if (dataStorage) {
                    dataMap.set(id, dataStorage);
                }
            }
            let languageDataMap = this._saveDataMap.get(language) || new Map<string, Map<number, IDataStorage>>();
            languageDataMap.set(type, dataMap);
            this._saveDataMap.set(language, languageDataMap);
        }
    }

    public BindAutoDevExtension(autodev: AutoDevExtension) {
        this._autodev = autodev;
    }

    dispose(): void {
        Disposable.from(...this._disposables).dispose();
        this._disposables.length = 0;
        this._listenerMap.clear();
        this._saveDataIdMap.clear();
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

    public async AddDataStorage(language: string, dataStorage: IDataStorage) {
        let key = dataStorage.GetType();
        if (this._saveDataIdMap.has(language)) {
            let languageDataStorageMap = this._saveDataIdMap.get(language);
            if (languageDataStorageMap != undefined) {
                let dataStorages = languageDataStorageMap?.get(key);
                if (dataStorages != undefined) {
                    let hasDataStorage = await this._sqlManager?.HasDataStorage(language, dataStorage);
                    if (hasDataStorage) {
                        return;
                    }
                    let dataStorageId = await this._sqlManager?.SaveDataStorage(language, dataStorage);
                    if (dataStorageId != undefined) {
                        dataStorages.add(dataStorageId);
                        dataStorage.id = dataStorageId; // 更新 dataStorage 的 id
                        this.saveDataToCache(language, key, dataStorageId, dataStorage); // 存档到 _saveDataMap
                    }
                    let dataDataStorageMap = new Map<string, Set<number>>();
                    dataDataStorageMap.set(key, dataStorages);
                    for (const [key, value] of languageDataStorageMap) {
                        dataDataStorageMap.set(key, value);
                    }
                    this._saveDataIdMap.set(language, dataDataStorageMap);
                } else {
                    dataStorages = new Set<number>();
                    let dataStorageId = await this._sqlManager?.SaveDataStorage(language, dataStorage);
                    if (dataStorageId != undefined) {
                        dataStorages.add(dataStorageId);
                        dataStorage.id = dataStorageId; // 更新 dataStorage 的 id
                        this.saveDataToCache(language, key, dataStorageId, dataStorage); // 存档到 _saveDataMap
                    }
                    languageDataStorageMap.set(key, dataStorages);
                }
            } else {
                languageDataStorageMap = new Map<string, Set<number>>();
                let dataStorages: Set<number> = new Set<number>();
                let dataStorageId = await this._sqlManager?.SaveDataStorage(language, dataStorage);
                if (dataStorageId != undefined) {
                    dataStorages.add(dataStorageId);
                    dataStorage.id = dataStorageId; // 更新 dataStorage 的 id
                    this.saveDataToCache(language, key, dataStorageId, dataStorage); // 存档到 _saveDataMap
                    languageDataStorageMap.set(key, dataStorages);
                }
            }
        } else {
            const dataStorages: Set<number> = new Set<number>();
            let dataStorageId = await this._sqlManager?.SaveDataStorage(language, dataStorage);
            if (dataStorageId != undefined) {
                dataStorages.add(dataStorageId);
                dataStorage.id = dataStorageId; // 更新 dataStorage 的 id
                this.saveDataToCache(language, key, dataStorageId, dataStorage); // 存档到 _saveDataMap
            }

            let dataDataStorageMap = new Map<string, Set<number>>();
            dataDataStorageMap.set(key, dataStorages);
            let temp = this._saveDataIdMap.get(language);
            if (temp != undefined) {
                for (const [key, value] of temp) {
                    dataDataStorageMap.set(key, value);
                }
            }

            this._saveDataIdMap.set(language, dataDataStorageMap);
        }
        let editor = vscode.window.activeTextEditor;
        if (editor) {
            let document = editor.document;
            vscode.commands.executeCommand('vscode.executeCodeLensProvider', document.uri);
        }
        this._autodev?.chat.send('WorkspaceService_AddDataStorage', 'test');
    }

    private saveDataToCache(language: string, key: string, id: number, dataStorage: IDataStorage) {
        if (!this._saveDataMap.has(language)) {
            this._saveDataMap.set(language, new Map<string, Map<number, IDataStorage>>());
        }
        let languageDataMap = this._saveDataMap.get(language);
        if (!languageDataMap?.has(key)) {
            languageDataMap?.set(key, new Map<number, IDataStorage>());
        }
        languageDataMap?.get(key)?.set(id, dataStorage);
    }

    public async RemoveDataStorage(language: string, dataStorage: IDataStorage) {
        if (!this._saveDataIdMap.has(language)) {
            return;
        } else {
            let key = dataStorage.GetType();
            if (this._saveDataIdMap.has(language)) {
                let languageDataStorageMap = this._saveDataIdMap.get(language);
                if (languageDataStorageMap != undefined) {
                    let dataStorages = languageDataStorageMap?.get(key);
                    let storageId = await this._sqlManager?.GetDataStorageId(language, dataStorage);
                    let removeSuccess = await this._sqlManager?.RemoveDataStorage(language, dataStorage);
                    if (storageId != undefined && dataStorages != undefined && removeSuccess) {
                        dataStorages?.delete(storageId);
                        languageDataStorageMap.set(key, dataStorages);
                        this._saveDataMap.get(language)?.get(key)?.delete(storageId); // 从 _saveDataMap 中删除
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

    public async ChangeDataStorage(language: string, key: string, ollDataStorage: IDataStorage, newDataStorage: IDataStorage) {
        if (!this._saveDataIdMap.has(language)) {
            return;
        } else {
            if (this._saveDataIdMap.has(language)) {
                let languageDataStorageMap = this._saveDataIdMap.get(language);
                if (languageDataStorageMap != undefined) {
                    let dataStorages = languageDataStorageMap?.get(key);
                    if (dataStorages != undefined) {
                        let storageId = await this._sqlManager?.GetDataStorageId(language, ollDataStorage);
                        if (storageId != undefined) {
                            this._saveDataMap.get(language)?.get(key)?.delete(storageId);
                            this._saveDataMap.get(language)?.get(key)?.set(storageId, newDataStorage);
                            await this._sqlManager?.ChangeDataStorage(language, ollDataStorage, newDataStorage);
                        }
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

    public  GetDataStorages(language: string, key: string): IDataStorage[] | undefined {
        let dataDataStorageMap = this._saveDataMap.get(language);
        if (dataDataStorageMap) {
            let datas = dataDataStorageMap.get(key);
            if (datas) {
                let dataObjects: IDataStorage[] = [];
                for (const [id, data] of datas) {
                        dataObjects.push(data);
                }
                return dataObjects;
            }
            return undefined;
        } else {
            return undefined;
        }
    }
		public GetDataStoragesByIds(language: string, key: string, ids: number[]): IDataStorage[] | undefined {
        let dataDataStorageMap = this._saveDataMap.get(language);
        if (dataDataStorageMap) {
            let datas = dataDataStorageMap.get(key);
            if (datas) {
                let dataObjects: IDataStorage[] = [];
                for (const [id, data] of datas) {
									if (ids.includes(id)) {
									  dataObjects.push(data);
									}
								}
								return dataObjects;
							}else {
                return undefined;
							}
        }
        return undefined;
		}

    public async GetDataStorageById(language: string, type: string, id: number): Promise<IDataStorage | undefined> {
        return this._saveDataMap.get(language)?.get(type)?.get(id);
    }

    public HasDataStorage(language: string, dataStorage: IDataStorage): boolean {
        let key = dataStorage.GetType();
        if (this._saveDataIdMap.has(language)) {
            let languageDataStorageMap = this._saveDataIdMap.get(language);
            if (languageDataStorageMap != undefined) {
                let dataStorages = languageDataStorageMap?.get(key);
                if (dataStorages == undefined) {
                    return false;
                } else {
                    return dataStorages.has(dataStorage.id) || this.checkDataInCache(language, key, dataStorage);
                }
            }
        }
        return false;
    }

    private checkDataInCache(language: string, key: string, dataStorage: IDataStorage): boolean {
        let languageDataMap = this._saveDataMap.get(language);
        if (languageDataMap) {
            let dataMap = languageDataMap.get(key);
            if (dataMap) {
                for (const [id, cachedData] of dataMap) {
                    if (cachedData.equals(dataStorage)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

}

export interface IDataStorage {
    id: number; // 新增 id 属性
    GetType(): string;
    equals(t: IDataStorage): boolean;
}

import sqlite3 from 'sqlite3';

import { WorkspaceSqlManager } from './WorkspaceSqlManager';

export class DataStorageGroupManager {
	private _groupMap: Map<string, Map<string, number[]>>;
	private _sqlManager: WorkspaceSqlManager;
	private _selectedGroupName: string;

	constructor(sqlManager: WorkspaceSqlManager) {
		this._groupMap = new Map<string, Map<string, number[]>>();
		this._sqlManager = sqlManager;
		this.initializeDatabase();
		this.loadGroupsFromDatabase();
		this._selectedGroupName = '';
	}

	private initializeDatabase() {
		// 创建 Groups 表
		this._sqlManager.Run(`
            CREATE TABLE IF NOT EXISTS Groups (
                id INTEGER PRIMARY KEY,
                name TEXT,
                groupJson TEXT
            )
        `);
	}

	private async loadGroupsFromDatabase() {
		const rows = await this.queryDatabase(`SELECT * FROM Groups`);
		rows.forEach(row => {
			const groupName = row.name;
			const groupJson = JSON.parse(row.groupJson);
			const groupMap = new Map<string, number[]>();
			for (const [key, value] of Object.entries(groupJson)) {
				groupMap.set(key, value as number[]);
			}
			this._groupMap.set(groupName, groupMap);
		});
	}

	private async queryDatabase(query: string, params: any[] = []): Promise<any[]> {
		return new Promise((resolve, reject) => {
			this._sqlManager.All(query, params, (err, rows) => {
				if (err) {
					reject(err);
				} else {
					let temp = rows as any[];
					resolve(temp);
				}
			});
		});
	}

	public AddGroupItem(group: string, itemType: string, value: number) {
		if (!this._groupMap.has(group)) {
			this._groupMap.set(group, new Map<string, number[]>());
		}
		const groupMap = this._groupMap.get(group)!;
		if (!groupMap.has(itemType)) {
			groupMap.set(itemType, []);
		}
		const itemList = groupMap.get(itemType)!;
		if (!itemList.includes(value)) {
			itemList.push(value);
		}
		this.saveGroupToDatabase(group, groupMap);
	}

	public AddGroupItems(group: string, itemType: string, values: number[]) {
		if (!this._groupMap.has(group)) {
			this._groupMap.set(group, new Map<string, number[]>());
		}
		const groupMap = this._groupMap.get(group)!;
		if (!groupMap.has(itemType)) {
			groupMap.set(itemType, []);
		}
		const itemList = groupMap.get(itemType)!;
		values.forEach(value => {
			if (!itemList.includes(value)) {
				itemList.push(value);
			}
		});
		this.saveGroupToDatabase(group, groupMap);
	}

	public RemoveGroupItem(group: string, itemType: string, value: number) {
		if (this._groupMap.has(group)) {
			const groupMap = this._groupMap.get(group)!;
			if (groupMap.has(itemType)) {
				const itemList = groupMap.get(itemType)!;
				const index = itemList.indexOf(value);
				if (index !== -1) {
					itemList.splice(index, 1);
				}
				if (itemList.length === 0) {
					groupMap.delete(itemType);
				}
				if (groupMap.size === 0) {
					this._groupMap.delete(group);
				}
				this.saveGroupToDatabase(group, groupMap);
			}
		}
	}

	public RemoveGroupItems(group: string, itemType: string, values: number[]) {
		if (this._groupMap.has(group)) {
			const groupMap = this._groupMap.get(group)!;
			if (groupMap.has(itemType)) {
				const itemList = groupMap.get(itemType)!;
				values.forEach(value => {
					const index = itemList.indexOf(value);
					if (index !== -1) {
						itemList.splice(index, 1);
					}
				});
				if (itemList.length === 0) {
					groupMap.delete(itemType);
				}
				if (groupMap.size === 0) {
					this._groupMap.delete(group);
				}
				this.saveGroupToDatabase(group, groupMap);
			}
		}
	}

	public RemoveGroup(group: string) {
		if (this._groupMap.has(group)) {
			this._groupMap.delete(group);
			this.deleteGroupFromDatabase(group);
		}
	}

	public GetGroupInfo(group: string): Map<string, number[]> | undefined {
		return this._groupMap.get(group);
	}
	public GetGroups(): Map<string, Map<string, number[]>> {
		return this._groupMap;
	}
	public GetSelectedGroup(): Map<string, number[]> | undefined {
		return this.GetGroupInfo(this._selectedGroupName);
	}


	private async saveGroupToDatabase(group: string, groupMap: Map<string, number[]>) {
		const groupJson = JSON.stringify(Object.fromEntries(groupMap));
		const existingGroup = await this.queryDatabase(`SELECT * FROM Groups WHERE name = ?`, [group]);
		if (existingGroup.length > 0) {
			await this.runDatabase(`UPDATE Groups SET groupJson = ? WHERE name = ?`, [groupJson, group]);
		} else {
			await this.runDatabase(`INSERT INTO Groups (name, groupJson) VALUES (?, ?)`, [group, groupJson]);
		}
	}

	private async deleteGroupFromDatabase(group: string) {
		await this.runDatabase(`DELETE FROM Groups WHERE name = ?`, [group]);
	}

	private async runDatabase(query: string, params: any[] = []): Promise<void> {
		return new Promise((resolve, reject) => {
			this._sqlManager.Run(query, params, err => {
				if (err) {
					reject(err);
				} else {
					resolve();
				}
			});
		});
	}
}


export interface GroupMormat {
	name: string;
	items: string;
}
export interface Group {
	name: string;
	items: Map<string, number[]>;
}
// 将 Map 转换为普通对象的函数
export function MapToObject(map: Map<string, any>): { [key: string]: any } {
  const obj: { [key: string]: any } = {};
  map.forEach((value, key) => {
    if (value instanceof Map) {
      obj[key] = MapToObject(value);
    } else {
      obj[key] = value;
    }
  });
  return obj;
}

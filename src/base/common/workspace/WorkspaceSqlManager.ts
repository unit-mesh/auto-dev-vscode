import sqlite3 from 'sqlite3';
import { CodeSample } from 'src/action/addCodeSamples/AddCodeSampleExecutor';
import { FrameworkCodeFragment } from 'src/code-context/_base/LanguageModel/ClassElement/FrameworkCodeFragmentExtractorBase';

import { IDataStorage } from './WorkspaceService';

// 定义映射组
const typeMapping: { [key: string]: any } = {
	CodeSample: CodeSample,
	FrameworkCodeFragment: FrameworkCodeFragment,
};

export class WorkspaceSqlManager {
	private db: sqlite3.Database;

	constructor(dbPath: string) {
		this.db = new sqlite3.Database(dbPath);
		this.initializeDatabase();
	}

	private initializeDatabase() {
		const defaultData = {
			id: 100000,
			language: 'jsonc',
			code: 'none',
			doc: 'none',
			filePath: 'none',
			codeContext: 'none',
		};
		// 创建表
		this.db.run(
			`
            CREATE TABLE IF NOT EXISTS CodeSample (
                id INTEGER PRIMARY KEY,
                language TEXT,
                code TEXT,
                doc TEXT,
                filePath TEXT,
                codeContext TEXT
            )
        `,
			err => {
				if (err) {
					console.error(err.message);
				} else {
					this.db.run(
						`
								INSERT OR IGNORE INTO CodeSample (id, language, code, doc, filePath, codeContext)
								VALUES (?, ?, ?, ?, ?, ?)
						`,
						[
							defaultData.id,
							defaultData.language,
							defaultData.code,
							defaultData.doc,
							defaultData.filePath,
							defaultData.codeContext,
						],
					);
				}
			},
		);
		this.db.run(
			`
            CREATE TABLE IF NOT EXISTS FrameworkCodeFragment (
                id INTEGER PRIMARY KEY,
                language TEXT,
                code TEXT,
                doc TEXT,
                filePath TEXT,
                codeContext TEXT
            )
        `,
			err => {
				if (err) {
					console.error(err.message);
				} else {
					this.db.run(
						`
				INSERT OR IGNORE INTO FrameworkCodeFragment (id, language, code, doc, filePath, codeContext)
				VALUES (?, ?, ?, ?, ?, ?)
		`,
						[
							defaultData.id,
							defaultData.language,
							defaultData.code,
							defaultData.doc,
							defaultData.filePath,
							defaultData.codeContext,
						],
					);
				}
			},
		);
	}

	public GetAllDataStorageIds(language: string, type: string): Promise<number[]> {
		return new Promise((resolve, reject) => {
			const tableName = typeMapping[type].name;
			this.db.all(`SELECT id FROM ${tableName} WHERE language = ?`, [language], (err, rows) => {
				if (err) {
					reject(err);
				} else {
					resolve(rows.map(row => (row as any).id)); // 类型断言为 any 以访问 id 属性
				}
			});
		});
	}

	public LoadDataStorage(language: string, type: string, id: number): Promise<any | undefined> {
		return new Promise((resolve, reject) => {
			const tableName = typeMapping[type].name;
			this.db.get(`SELECT * FROM ${tableName} WHERE language = ? AND id = ?`, [language, id], (err, row) => {
				if (err) {
					reject(err);
				} else {
					if (row) {
						switch (type) {
							case 'CodeSample':
								const instance = CodeSample.DeserializationFormSql(row);
								instance.id = id;
								resolve(instance);
								break;
							case 'FrameworkCodeFragment':
								const instance2 = FrameworkCodeFragment.DeserializationFormSql(row);
								instance2.id = id;
								resolve(instance2);
								break;
						}
					} else {
						resolve(undefined);
					}
				}
			});
		});
	}

	public HasDataStorage(language: string, data: IDataStorage): Promise<boolean> {
		return new Promise((resolve, reject) => {
			const type = data.GetType();
			const tableName = typeMapping[type].name;
			const dataInstance = data as any; // 类型断言为 any 以访问 id 属性
			this.db.get(
				`SELECT * FROM ${tableName} WHERE language = ? AND id = ?`,
				[language, dataInstance.id],
				(err, row) => {
					if (err) {
						reject(err);
					} else {
						resolve(row !== undefined);
					}
				},
			);
		});
	}

	public RemoveDataStorage(language: string, data: IDataStorage): Promise<boolean>;
	public RemoveDataStorage(language: string, type: string, id: number): Promise<boolean>;
	public RemoveDataStorage(language: string, arg2: IDataStorage | string, arg3?: number): Promise<boolean> {
		return new Promise((resolve, reject) => {
			let type: string;
			let id: number;

			if (typeof arg2 === 'string') {
				type = arg2;
				id = arg3!;
			} else {
				type = arg2.GetType();
				id = (arg2 as any).id; // 类型断言为 any 以访问 id 属性
			}
			const tableName = typeMapping[type].name;
			if (id == undefined || id == -1) {
				let dataInstance = arg2 as any; // 类型断言为 any 以访问属性
				this.db.run(
					`DELETE FROM ${tableName} WHERE language = ? AND code = ? AND doc = ? AND filePath = ? AND codeContext = ?`,
					[language, dataInstance.code, dataInstance.doc, dataInstance.filePath, dataInstance.codeContext],
					function (err) {
						if (err) {
							reject(err);
						} else {
							resolve(this.changes > 0);
						}
					},
				);
			} else {
				this.db.run(`DELETE FROM ${tableName} WHERE language = ? AND id = ?`, [language, id], function (err) {
					if (err) {
						reject(err);
					} else {
						resolve(this.changes > 0);
					}
				});
			}
		});
	}

	public GetDataStorageId(language: string, data: IDataStorage): Promise<number | undefined> {
		return new Promise((resolve, reject) => {
			const type = data.GetType();
			const tableName = typeMapping[type].name;
			const dataInstance = data as any; // 类型断言为 any 以访问属性
			this.db.get(
				`SELECT id FROM ${tableName} WHERE language = ? AND code = ? AND doc = ? AND filePath = ? AND codeContext = ?`,
				[language, dataInstance.code, dataInstance.doc, dataInstance.filePath, dataInstance.codeContext],
				(err, row) => {
					if (err) {
						reject(err);
					} else {
						resolve(row ? (row as any).id : undefined); // 类型断言为 any 以访问 id 属性
					}
				},
			);
		});
	}

	public ChangeDataStorage(
		language: string,
		oldDataStorage: IDataStorage,
		newDataStorage: IDataStorage,
	): Promise<boolean> {
		return new Promise((resolve, reject) => {
			const oldType = oldDataStorage.GetType();
			const newType = newDataStorage.GetType();
			if (oldType !== newType) {
				reject(new Error('Types do not match'));
				return;
			}
			const tableName = typeMapping[oldType].name;
			const oldDataInstance = oldDataStorage as any; // 类型断言为 any 以访问 id 属性
			const newDataInstance = newDataStorage as any; // 类型断言为 any 以访问属性
			this.db.run(
				`UPDATE ${tableName} SET code = ?, doc = ?, filePath = ?, codeContext = ? WHERE language = ? AND id = ?`,
				[
					newDataInstance.code,
					newDataInstance.doc,
					newDataInstance.filePath,
					newDataInstance.codeContext,
					language,
					oldDataInstance.id,
				],
				function (err) {
					if (err) {
						reject(err);
					} else {
						resolve(this.changes > 0);
					}
				},
			);
		});
	}

	public SaveDataStorage(language: string, data: IDataStorage): Promise<number> {
		return new Promise((resolve, reject) => {
			const type = data.GetType();
			const tableName = typeMapping[type].name;
			const dataInstance = data as any; // 类型断言为 any 以访问属性

			// 检查数据是否已经存在
			this.GetDataStorageId(language, data)
				.then(existingId => {
					if (existingId !== undefined) {
						resolve(existingId);
					} else {
						// 插入新数据
						this.db.run(
							`INSERT INTO ${tableName} (language, code, doc, filePath, codeContext) VALUES (?, ?, ?, ?, ?)`,
							[language, dataInstance.code, dataInstance.doc, dataInstance.filePath, dataInstance.codeContext],
							function (err) {
								if (err) {
									reject(err);
								} else {
									resolve(this.lastID);
								}
							},
						);
					}
				})
				.catch(err => {
					reject(err);
				});
		});
	}

	public DataStorageToInstance<T>(data: IDataStorage): T {
		const type = data.GetType();
		return new typeMapping[type]() as T;
	}
	// 新增的 SQL 执行方法

	/**
	 * 执行单行查询
	 * @param sql SQL 语句
	 * @param params 参数
	 * @param callback 回调函数
	 * @returns 返回单行结果
	 */
	public Get<T>(
		sql: string,
		params: any[] = [],
		callback?: (err: Error | null, row?: T) => void,
	): Promise<T | undefined> {
		return new Promise((resolve, reject) => {
			this.db.get(sql, params, (err, row) => {
				if (err) {
					if (callback) callback(err);
					reject(err);
				} else {
					if (callback) callback(null, row as T);
					resolve(row as T | undefined);
				}
			});
		});
	}

	/**
	 * 执行 SQL 语句
	 * @param sql SQL 语句
	 * @param params 参数
	 * @param callback 回调函数
	 * @returns 返回受影响的行数
	 */
	public Run(
		sql: string,
		params: any[] = [],
		callback?: (err: Error | null, changes?: number) => void,
	): Promise<number> {
		return new Promise((resolve, reject) => {
			this.db.run(sql, params, function (err) {
				if (err) {
					if (callback) callback(err);
					reject(err);
				} else {
					if (callback) callback(null, this.changes);
					resolve(this.changes);
				}
			});
		});
	}

	/**
	 * 执行多行查询
	 * @param sql SQL 语句
	 * @param params 参数
	 * @param callback 回调函数
	 * @returns 返回多行结果
	 */
	public All<T>(sql: string, params: any[] = [], callback?: (err: Error | null, rows?: T[]) => void): Promise<T[]> {
		return new Promise((resolve, reject) => {
			this.db.all(sql, params, (err, rows) => {
				if (err) {
					if (callback) callback(err);
					reject(err);
				} else {
					if (callback) callback(null, rows as T[]);
					resolve(rows as T[]);
				}
			});
		});
	}
}

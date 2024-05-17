/**
 * Copyright 2023 Continue
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { v4 as uuidv4 } from "uuid";
import { Connection, Table } from "vectordb";

import {
	BranchAndDir,
	CodebaseIndex,
	IndexingProgressUpdate,
	IndexResultType,
	IndexTag,
	MarkCompleteCallback,
	PathAndCacheKey,
	RefreshIndexResults,
	tagToString
} from "./_base/CodebaseIndex";
import { EmbeddingsProvider } from "../embedding/_base/EmbeddingsProvider";
import { Chunk } from "../chunk/_base/Chunk";
import { MAX_CHUNK_SIZE } from "../utils/constants";
import { ChunkerManager } from "../chunk/ChunkerManager";
import { DatabaseConnection, SqliteDb } from "../database/SqliteDb";
import { getBasename, getLanceDbPath } from "../utils/IndexPathHelper";
import { Embedding } from "../embedding/_base/Embedding";

// LanceDB  converts to lowercase, so names must all be lowercase
interface LanceDbRow {
	uuid: string;
	path: string;
	cachekey: string;
	vector: Embedding;

	[key: string]: any;
}

export class LanceDbIndex implements CodebaseIndex {
	get artifactId(): string {
		return "vectordb::" + this.embeddingsProvider?.id;
	}

	constructor(
		private readonly embeddingsProvider: EmbeddingsProvider,
		private readonly readFile: (filepath: string) => Promise<string>,
	) {
		this.embeddingsProvider = embeddingsProvider;
	}

	private tableNameForTag(tag: IndexTag) {
		return tagToString(tag)
			.replace(/\//g, "")
			.replace(/\\/g, "")
			.replace(/\:/g, "");
	}

	private async* computeChunks(items: PathAndCacheKey[],): AsyncGenerator<| [number, LanceDbRow, {
		startLine: number;
		endLine: number;
		contents: string
	}, string,] | PathAndCacheKey> {
		const contents = await Promise.all(
			items.map(({ path }) => this.readFile(path)),
		);

		for (let i = 0; i < items.length; i++) {
			// Break into chunks
			const content = contents[i];
			const chunks: Chunk[] = [];

			for await (let chunk of ChunkerManager.getInstance().chunkDocument(
				items[i].path,
				content,
				MAX_CHUNK_SIZE,
				items[i].cacheKey,
			)) {
				chunks.push(chunk);
			}

			if (chunks.length > 20) {
				// Too many chunks to index, probably a larger file than we want to include
				continue;
			}

			// Calculate embeddings
			let embeddings: Embedding[] = [];
			try {
				embeddings = await this.embeddingsProvider.embed(
					chunks.map((c) => c.content),
				);
			} catch (e) {
				console.error("Failed to embed chunks", items[i].path, e);
				continue;
			}

			// Create row format
			for (let j = 0; j < chunks.length; j++) {
				const progress = (i + j / chunks.length) / items.length;
				const row = {
					vector: embeddings[j],
					path: items[i].path,
					cachekey: items[i].cacheKey,
					uuid: uuidv4(),
				};
				const chunk = chunks[j];
				yield [
					progress,
					row,
					{
						contents: chunk.content,
						startLine: chunk.startLine,
						endLine: chunk.endLine,
					},
					`Indexing ${getBasename(chunks[j].filepath)}`,
				];
			}

			yield items[i];
		}
	}

	private async createSqliteCacheTable(db: DatabaseConnection) {
		await db.exec(`CREATE TABLE IF NOT EXISTS lance_db_cache (
        uuid TEXT PRIMARY KEY,
        cacheKey TEXT NOT NULL,
        path TEXT NOT NULL,
        vector TEXT NOT NULL,
        startLine INTEGER NOT NULL,
        endLine INTEGER NOT NULL,
        contents TEXT NOT NULL,
				language TEXT
    )`);
	}

	async* update(tag: IndexTag,
	             results: RefreshIndexResults,
	             markComplete: MarkCompleteCallback,
	             repoName: string | undefined
	): AsyncGenerator<IndexingProgressUpdate> {
		const lancedb = await import("vectordb");
		const tableName = this.tableNameForTag(tag);
		const db = await lancedb.connect(getLanceDbPath());

		const sqlite = await SqliteDb.get();
		await this.createSqliteCacheTable(sqlite);

		// Compute
		let table: Table<number[]> | undefined = undefined;
		let needToCreateTable = true;
		const existingTables = await db.tableNames();

		const addComputedLanceDbRows = async (
			pathAndCacheKey: PathAndCacheKey,
			computedRows: LanceDbRow[],
		) => {
			// Create table if needed, add computed rows
			if (table) {
				if (computedRows.length > 0) {
					await table.add(computedRows);
				}
			} else if (existingTables.includes(tableName)) {
				table = await db.openTable(tableName);
				needToCreateTable = false;
				if (computedRows.length > 0) {
					await table.add(computedRows);
				}
			} else if (computedRows.length > 0) {
				table = await db.createTable(tableName, computedRows);
				needToCreateTable = false;
			}

			// Mark item complete
			markComplete([pathAndCacheKey], IndexResultType.Compute);
		};

		let computedRows: LanceDbRow[] = [];
		for await (const update of this.computeChunks(results.compute)) {
			if (Array.isArray(update)) {
				const [progress, row, data, desc] = update;
				computedRows.push(row);

				// Add the computed row to the cache
				await sqlite.run(
					"INSERT INTO lance_db_cache (uuid, cacheKey, path, vector, startLine, endLine, contents) VALUES (?, ?, ?, ?, ?, ?, ?)",
					row.uuid,
					row.cachekey,
					row.path,
					JSON.stringify(row.vector),
					data.startLine,
					data.endLine,
					data.contents,
				);

				yield { progress, desc };
			} else {
				await addComputedLanceDbRows(update, computedRows);
				computedRows = [];
			}
		}

		// Add tag - retrieve the computed info from lance sqlite cache
		for (let { path, cacheKey } of results.addTag) {
			const stmt = await sqlite.prepare(
				"SELECT * FROM lance_db_cache WHERE cacheKey = ? AND path = ?",
				cacheKey,
				path,
			);
			const cachedItems = await stmt.all();

			const lanceRows: LanceDbRow[] = cachedItems.map((item) => {
				// Schema<{ 0: vector: FixedSizeList[1]<Float32>, 1: path: Utf8, 2: cachekey: Utf8, 3: uuid: Utf8 }>
				return {
					path,
					cachekey: cacheKey,
					uuid: item.uuid,
					vector: JSON.parse(item.vector),
				};
			});

			if (needToCreateTable && lanceRows.length > 0) {
				table = await db.createTable(tableName, lanceRows);
				needToCreateTable = false;
			} else if (lanceRows.length > 0) {
				await table!.add(lanceRows);
			}

			markComplete([{ path, cacheKey }], IndexResultType.AddTag);
		}

		// Delete or remove tag - remove from lance table)
		if (!needToCreateTable) {
			for (let { path, cacheKey } of [...results.removeTag, ...results.del]) {
				// This is where the aforementioned lowercase conversion problem shows
				await table!.delete(`cachekey = '${cacheKey}' AND path = '${path}'`);
			}
		}
		markComplete(results.removeTag, IndexResultType.RemoveTag);

		// Delete - also remove from sqlite cache
		for (let { path, cacheKey } of results.del) {
			await sqlite.run(
				"DELETE FROM lance_db_cache WHERE cacheKey = ? AND path = ?",
				cacheKey,
				path,
			);
		}

		markComplete(results.del, IndexResultType.Delete);
		yield { progress: 1, desc: "Completed Calculating Embeddings" };
	}

	async retrieve(
		query: string,
		n: number,
		tags: BranchAndDir[],
		filterDirectory: string | undefined,
	): Promise<Chunk[]> {
		const lancedb = await import("vectordb");
		if (!lancedb.connect) {
			throw new Error("LanceDB failed to load a native module");
		}
		const [vector] = await this.embeddingsProvider?.embed([query]) ?? [[]];
		if (!vector) {
			return [];
		}

		const db = await lancedb.connect(getLanceDbPath());

		let allResults = [];
		for (const tag of tags) {
			const results = await this._retrieveForTag(
				{ ...tag, artifactId: this.artifactId },
				n,
				filterDirectory,
				vector,
				db,
			);
			allResults.push(...results);
		}

		allResults = allResults
			.sort((a, b) => a._distance - b._distance)
			.slice(0, n);

		const sqliteDb = await SqliteDb.get();
		const data = await sqliteDb.all(
			`SELECT * FROM lance_db_cache WHERE uuid in (${allResults
				.map((r) => `'${r.uuid}'`)
				.join(",")})`,
		);

		return data.map((d) => {
			return {
				digest: d.cacheKey,
				filepath: d.path,
				startLine: d.startLine,
				endLine: d.endLine,
				index: 0,
				content: d.contents,
				language: d.language,
			};
		});
	}

	private async _retrieveForTag(
		tag: IndexTag,
		n: number,
		directory: string | undefined,
		vector: Embedding,
		db: Connection, /// lancedb.Connection
	): Promise<LanceDbRow[]> {
		const tableName = this.tableNameForTag(tag);
		const tableNames = await db.tableNames();
		if (!tableNames.includes(tableName)) {
			return [];
		}

		const table = await db.openTable(tableName);

		let query = table.search(vector);
		if (directory) {
			// seems like lancedb is only post-filtering, so have to return a bunch of results and slice after
			query = query.where(`path LIKE '${directory}%'`).limit(300);
		} else {
			query = query.limit(n);
		}
		const results = await query.execute();
		return results.slice(0, n) as any;
	}
}
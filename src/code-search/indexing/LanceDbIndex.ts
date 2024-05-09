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
import path from "path";
import fs from "fs";
import os from "os";
import { v4 as uuidv4 } from "uuid";

import {
	CodebaseIndex,
	IndexTag,
	IndexingProgressUpdate,
	tagToString,
	PathAndCacheKey,
	RefreshIndexResults, MarkCompleteCallback, IndexResultType
} from "./_base/CodebaseIndex";
import { EmbeddingsProvider } from "../embedding/_base/EmbeddingsProvider";
import { Chunk } from "../chunk/_base/Chunk";
import { MAX_CHUNK_SIZE } from "../constants";
import { ChunkerManager } from "../chunk/ChunkerManager";
import { Table } from "vectordb";

export function getAutoDevGlobalPath(): string {
	// This is ~/.autodev on mac/linux
	const autodevPath = path.join(os.homedir(), ".autodev");
	if (!fs.existsSync(autodevPath)) {
		fs.mkdirSync(autodevPath);
	}
	return autodevPath;
}

export function getIndexFolderPath(): string {
	const indexPath = path.join(getAutoDevGlobalPath(), "index");
	if (!fs.existsSync(indexPath)) {
		fs.mkdirSync(indexPath);
	}
	return indexPath;
}

export function getLanceDbPath(): string {
	return path.join(getIndexFolderPath(), "lancedb");
}

// LanceDB  converts to lowercase, so names must all be lowercase
interface LanceDbRow {
	uuid: string;
	path: string;
	cachekey: string;
	vector: number[];

	[key: string]: any;
}

export function getBasename(filepath: string, n: number = 1): string {
	return filepath.split(/[\\/]/).pop() ?? "";
}

export class LanceDbIndex implements CodebaseIndex {
	get artifactId(): string {
		return "vectordb::" + this.embeddingsProvider.id;
	}

	constructor(
		private readonly embeddingsProvider: EmbeddingsProvider,
		private readonly readFile: (filepath: string) => Promise<string>,
	) {
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
			const embeddings = await this.embeddingsProvider.embed(
				chunks.map((c) => c.content),
			);

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

	async* update(tag: IndexTag,
	             results: RefreshIndexResults,
	             markComplete: MarkCompleteCallback,
	             repoName: string | undefined
	): AsyncGenerator<IndexingProgressUpdate> {
		const lancedb = await import("vectordb");
		const tableName = this.tableNameForTag(tag);
		const db = await lancedb.connect(getLanceDbPath());

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

			markComplete([pathAndCacheKey], IndexResultType.Compute);
		};

		let computedRows: LanceDbRow[] = [];
		for await (const update of this.computeChunks(results.compute)) {
			if (Array.isArray(update)) {
				const [progress, row, data, desc] = update;
				computedRows.push(row);

				yield { progress, desc };
			} else {
				await addComputedLanceDbRows(update, computedRows);
				computedRows = [];
			}
		}

		// Delete or remove tag - remove from lance table)
		if (!needToCreateTable) {
			for (let { path, cacheKey } of [...results.removeTag, ...results.del]) {
				// This is where the aforementioned lowercase conversion problem shows
				await table!.delete(`cachekey = '${cacheKey}' AND path = '${path}'`);
			}
		}

		markComplete(results.removeTag, IndexResultType.RemoveTag);

		markComplete(results.del, IndexResultType.Delete);
		yield { progress: 1, desc: "Completed Calculating Embeddings" };
	}

}
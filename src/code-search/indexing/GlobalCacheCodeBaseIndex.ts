/**
 *  Copyright 2023 Continue Dev, Inc.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
import {
	CodebaseIndex,
	IndexingProgressUpdate,
	IndexTag,
	MarkCompleteCallback,
	RefreshIndexResults
} from "./_base/CodebaseIndex";
import { DatabaseConnection, SqliteDb } from "../database/SqliteDb";

export class GlobalCacheCodeBaseIndex implements CodebaseIndex {
	private db: DatabaseConnection;

	constructor(db: DatabaseConnection) {
		this.db = db;
	}

	artifactId: string = "globalCache";

	static async create(): Promise<GlobalCacheCodeBaseIndex> {
		return new GlobalCacheCodeBaseIndex(await SqliteDb.get());
	}

	async* update(
		tag: IndexTag,
		results: RefreshIndexResults,
		_: MarkCompleteCallback,
		repoName: string | undefined,
	): AsyncGenerator<IndexingProgressUpdate> {
		const add = [...results.compute, ...results.addTag];
		const remove = [...results.del, ...results.removeTag];
		await Promise.all([
			...add.map(({ cacheKey }) => {
				return this.computeOrAddTag(cacheKey, tag);
			}),
			...remove.map(({ cacheKey }) => {
				return this.deleteOrRemoveTag(cacheKey, tag);
			}),
		]);
		yield { progress: 1, desc: "Done updating global cache" };
	}

	private async computeOrAddTag(
		cacheKey: string,
		tag: IndexTag,
	): Promise<void> {
		await this.db.run(
			"INSERT INTO global_cache (cacheKey, dir, branch, artifactId) VALUES (?, ?, ?, ?)",
			cacheKey,
			tag.directory,
			tag.branch,
			tag.artifactId,
		);
	}

	private async deleteOrRemoveTag(
		cacheKey: string,
		tag: IndexTag,
	): Promise<void> {
		await this.db.run(
			"DELETE FROM global_cache WHERE cacheKey = ? AND dir = ? AND branch = ? AND artifactId = ?",
			cacheKey,
			tag.directory,
			tag.branch,
			tag.artifactId,
		);
	}
}
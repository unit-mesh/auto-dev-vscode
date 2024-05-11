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
	IndexingProgressUpdate, IndexTag,
} from "./indexing/_base/CodebaseIndex";
import { LanceDbIndex } from "./indexing/LanceDbIndex";
import { IdeAction } from "../editor/editor-api/IdeAction";
import { EmbeddingsProvider } from "./embedding/_base/EmbeddingsProvider";
import { getComputeDeleteAddRemove } from "./refreshIndex";

export class CodebaseIndexer {
	ide: IdeAction;
	embeddingsProvider: EmbeddingsProvider;

	constructor(embeddingsProvider: EmbeddingsProvider, ideAction: IdeAction) {
		this.ide = ideAction;
		this.embeddingsProvider = embeddingsProvider;
	}

	private async getIndexesToBuild(): Promise<CodebaseIndex[]> {
		const indexes = [
			// new ChunkCodebaseIndex(),
			// new FullTextSearchCodebaseIndex(),
			// new CodeSnippetsCodebaseIndex(),
			new LanceDbIndex(
				this.embeddingsProvider,
				this.ide.readFile.bind(this.ide),
			)
		];

		return indexes;
	}

	async* refresh(
		workspaceDirs: string[],
		abortSignal: AbortSignal,
	): AsyncGenerator<IndexingProgressUpdate> {
		// const config = await this.configHandler.loadConfig();
		// if (config.disableIndexing) {
		// 	return;
		// }
		const indexesToBuild = await this.getIndexesToBuild();

		let completedDirs = 0;

		// Wait until Git Extension has loaded to report progress
		// so we don't appear stuck at 0% while waiting
		if (workspaceDirs.length > 0) {
			await this.ide.getRepoName(workspaceDirs[0]);
		}
		yield {
			progress: 0,
			desc: "Starting indexing...",
		};

		for (let directory of workspaceDirs) {
			const stats = await this.ide.getStats(directory);
			const branch = await this.ide.getBranch(directory);
			const repoName = await this.ide.getRepoName(directory);
			let completedIndexes = 0;

			try {
				for (let codebaseIndex of indexesToBuild) {
					const tag: IndexTag = {
						directory,
						branch,
						artifactId: codebaseIndex.artifactId,
					};
					const [results, markComplete] = await getComputeDeleteAddRemove(
						tag,
						{ ...stats },
						(filepath) => this.ide.readFile(filepath),
						repoName,
					);

					for await (let { progress, desc } of codebaseIndex.update(
						tag,
						results,
						markComplete,
						repoName,
					)) {
						// Handle pausing in this loop because it's the only one really taking time
						if (abortSignal.aborted) {
							yield {
								progress: 1,
								desc: "Indexing cancelled",
							};
							return;
						}
						// while (this.pauseToken.paused) {
						// 	await new Promise((resolve) => setTimeout(resolve, 100));
						// }

						yield {
							progress:
								(completedDirs +
									(completedIndexes + progress) / indexesToBuild.length) /
								workspaceDirs.length,
							desc,
						};
					}
					completedIndexes++;
					yield {
						progress:
							(completedDirs + completedIndexes / indexesToBuild.length) /
							workspaceDirs.length,
						desc: "Completed indexing " + codebaseIndex.artifactId,
					};
				}
			} catch (e) {
				console.warn("Error refreshing index: ", e);
			}

			completedDirs++;
			yield {
				progress: completedDirs / workspaceDirs.length,
				desc: "Indexing Complete",
			};
		}
	}
}

import {
	CodebaseIndex,
	IndexingProgressUpdate,
} from "./indexing/_base/CodebaseIndex";
import { ChunkCodebaseIndex } from "./indexing/ChunkCodebaseIndex";
import { FullTextSearchCodebaseIndex } from "./indexing/FullTextSearchCodebaseIndex";
import { CodeSnippetsCodebaseIndex } from "./indexing/CodeSnippetsCodebaseIndex";
import { LanceDbIndex } from "./indexing/LanceDbIndex";
import { IdeAction } from "../editor/editor-api/IdeAction";
import { EmbeddingsProvider } from "./embedding/_base/EmbeddingsProvider";

export class CodebaseIndexer {
	ide: IdeAction;
	embeddingsProvider: EmbeddingsProvider;

	constructor(embeddingsProvider: EmbeddingsProvider, ideAction: IdeAction) {
		this.ide = ideAction;
		this.embeddingsProvider = embeddingsProvider;
	}

	private async getIndexesToBuild(): Promise<CodebaseIndex[]> {
		const indexes = [
			new ChunkCodebaseIndex(),
			new FullTextSearchCodebaseIndex(),
			new CodeSnippetsCodebaseIndex(),
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
		let completedDirs = 0;
		const indexesToBuild = await this.getIndexesToBuild();
		yield {
			progress: 0,
			desc: "Starting indexing...",
		};

		// for (let directory of workspaceDirs) {
		// 	const stats = await this.ide.getStats(directory);
		// 	const branch = await this.ide.getBranch(directory);
		// 	let completedIndexes = 0;
		// 	const repoName = await this.ide.getRepoName(directory);
		//
		// 	try {
		// 		for (let codebaseIndex of indexesToBuild) {
		// 			const tag: IndexTag = {
		// 				directory,
		// 				branch,
		// 				artifactId: codebaseIndex.artifactId,
		// 			};
		// 			const [results, markComplete] = await getComputeDeleteAddRemove(
		// 				tag,
		// 				{ ...stats },
		// 				(filepath) => this.ide.readFile(filepath),
		// 			);
		//
		// 			for await (let { progress, desc } of codebaseIndex.update(
		// 				tag,
		// 				results,
		// 				markComplete,
		// 				repoName,
		// 			)) {
		// 				yield {
		// 					progress:
		// 						(completedDirs +
		// 							(completedIndexes + progress) / indexesToBuild.length) /
		// 						workspaceDirs.length,
		// 					desc,
		// 				};
		// 			}
		// 			completedIndexes++;
		// 			yield {
		// 				progress:
		// 					(completedDirs + completedIndexes / indexesToBuild.length) /
		// 					workspaceDirs.length,
		// 				desc: "Completed indexing " + codebaseIndex.artifactId,
		// 			};
		// 		}
		// 	} catch (e) {
		// 		console.warn("Error refreshing index: ", e);
		// 	}
		//
		// 	completedDirs++;
		// 	yield {
		// 		progress: completedDirs / workspaceDirs.length,
		// 		desc: "Indexing Complete",
		// 	};
		// }
	}
}

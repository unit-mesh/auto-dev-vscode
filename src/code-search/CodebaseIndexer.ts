import { CodebaseIndex, IndexingProgressUpdate } from "./indexing/CodebaseIndex";
import { ChunkCodebaseIndex } from "./indexing/ChunkCodebaseIndex";
import { FullTextSearchCodebaseIndex } from "./indexing/FullTextSearchCodebaseIndex";
import { CodeSnippetsCodebaseIndex } from "./indexing/CodeSnippetsCodebaseIndex";
import { TransformersEmbeddingProvider } from "./embedding/TransformersEmbeddingProvider";

export class CodebaseIndexer {
	async init() {
		try {
			let embeddingProvider = new TransformersEmbeddingProvider();
			embeddingProvider.embed(["test"]);
		} catch (e) {
			console.error(e);
		}
	}

	private async getIndexesToBuild(): Promise<CodebaseIndex[]> {
		const indexes = [
			new ChunkCodebaseIndex(),
			new FullTextSearchCodebaseIndex(),
			new CodeSnippetsCodebaseIndex(),
		];

		return indexes;
	}

	async* refresh(
		workspaceDirs: string[],
		abortSignal: AbortSignal,
	): AsyncGenerator<IndexingProgressUpdate> {
		const indexesToBuild = await this.getIndexesToBuild();
		yield {
			progress: 0,
			desc: "Starting indexing...",
		};

		for (let directory of workspaceDirs) {
			//getRepoName
		}
	}
}
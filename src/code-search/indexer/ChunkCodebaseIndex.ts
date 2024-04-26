import { CodebaseIndex, IndexTag, IndexingProgressUpdate } from "./CodebaseIndex";

export class ChunkCodebaseIndex implements CodebaseIndex {
	static artifactId: string = "chunks";
	artifactId: string = ChunkCodebaseIndex.artifactId;

	update(tag: IndexTag, repoName: string | undefined): AsyncGenerator<IndexingProgressUpdate, any, unknown> {
		throw new Error("Method not implemented.");
	}

}
import {
	CodebaseIndex,
	IndexTag,
	IndexingProgressUpdate,
	RefreshIndexResults,
	MarkCompleteCallback
} from "./_base/CodebaseIndex";

export class ChunkCodebaseIndex implements CodebaseIndex {
	static artifactId: string = "chunks";
	artifactId: string = ChunkCodebaseIndex.artifactId;

	update(tag: IndexTag,
	       result: RefreshIndexResults,
	       markComplete: MarkCompleteCallback,
	       repoName: string | undefined): AsyncGenerator<IndexingProgressUpdate> {
		throw new Error("Method not implemented.");
	}
}
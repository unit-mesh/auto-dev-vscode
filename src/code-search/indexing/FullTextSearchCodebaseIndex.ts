import {
	CodebaseIndex,
	IndexTag,
	IndexingProgressUpdate,
	RefreshIndexResults,
	MarkCompleteCallback
} from "./_base/CodebaseIndex";

export class FullTextSearchCodebaseIndex implements CodebaseIndex {
	artifactId: string = "sqlite";

	update(tag: IndexTag, result: RefreshIndexResults, markComplete: MarkCompleteCallback, repoName: string | undefined): AsyncGenerator<IndexingProgressUpdate> {
		throw new Error("Method not implemented.");
	}
}
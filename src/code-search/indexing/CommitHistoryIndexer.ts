import {
	CodebaseIndex,
	IndexTag,
	IndexingProgressUpdate,
	MarkCompleteCallback,
	RefreshIndexResults
} from "./_base/CodebaseIndex";

/**
 * TODO: according commit messages to get by chunks
 * CommitHistoryIndexer is responsible for indexing commit history of a codebase.
 * Then, you can use {@link TfIdfSemanticChunkSearch} to search relative to commit history
 *
 * Based on Chunk indexing, we can get the commit change of code base, then it can be the user commits.
 */
export class CommitHistoryIndexer implements CodebaseIndex {
	artifactId: string = "commitHistory";

	update(tag: IndexTag, results: RefreshIndexResults, markComplete: MarkCompleteCallback, repoName: string | undefined): AsyncGenerator<IndexingProgressUpdate, any, unknown> {
		throw new Error("Method not implemented.");
	}
}
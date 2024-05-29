import {
	CodebaseIndex,
	IndexTag,
	IndexingProgressUpdate,
	RefreshIndexResults,
	MarkCompleteCallback
} from "../_base/CodebaseIndex";

export class ElasticSearchIndexer implements CodebaseIndex {
	artifactId = "elasticsearch";

	update(tag: IndexTag, result: RefreshIndexResults, markComplete: MarkCompleteCallback, repoName: string | undefined): AsyncGenerator<IndexingProgressUpdate> {
		throw new Error("Method not implemented.");
	}
}
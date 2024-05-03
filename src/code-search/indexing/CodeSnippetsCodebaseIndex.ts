import {
	CodebaseIndex,
	IndexTag,
	IndexingProgressUpdate,
	RefreshIndexResults,
	MarkCompleteCallback
} from "./_base/CodebaseIndex";

export class CodeSnippetsCodebaseIndex implements CodebaseIndex {
	artifactId = "codeSnippets";

	update(tag: IndexTag, result: RefreshIndexResults, markComplete: MarkCompleteCallback, repoName: string | undefined): AsyncGenerator<IndexingProgressUpdate> {
		throw new Error("Method not implemented.");
	}
}
export interface BranchAndDir {
	branch: string;
	directory: string;
}

export interface IndexTag extends BranchAndDir {
	artifactId: string;
}

export interface CodebaseIndex {
	artifactId: string;
	update(
		tag: IndexTag,
		repoName: string | undefined,
	): AsyncGenerator<IndexingProgressUpdate>;
}

export interface IndexingProgressUpdate {
	progress: number;
	desc: string;
}

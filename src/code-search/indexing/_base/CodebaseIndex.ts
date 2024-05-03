export function tagToString(tag: IndexTag): string {
	return `${tag.directory}::${tag.branch}::${tag.artifactId}`;
}

export type PathAndCacheKey = {
	path: string;
	cacheKey: string;
};

export type RefreshIndexResults = {
	compute: PathAndCacheKey[];
	del: PathAndCacheKey[];
	addTag: PathAndCacheKey[];
	removeTag: PathAndCacheKey[];
};

export interface BranchAndDir {
	branch: string;
	directory: string;
}

export interface IndexTag extends BranchAndDir {
	artifactId: string;
}

export enum IndexResultType {
	Compute = "compute",
	Delete = "del",
	AddTag = "addTag",
	RemoveTag = "removeTag",
}

export type MarkCompleteCallback = (
	items: PathAndCacheKey[],
	resultType: IndexResultType,
) => void;

export interface CodebaseIndex {
	artifactId: string;
	update(
		tag: IndexTag,
		results: RefreshIndexResults,
		markComplete: MarkCompleteCallback,
		repoName: string | undefined,
	): AsyncGenerator<IndexingProgressUpdate>;
}

export interface IndexingProgressUpdate {
	progress: number;
	desc: string;
}

/**
 * Copyright 2023 Continue
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
export function tagToString(tag: IndexTag): string {
	return `${tag.directory}::${tag.branch}::${tag.artifactId}`;
}

export type PathAndCacheKey = {
	path: string;
	cacheKey: string;
};

export type LastModifiedMap = {
	[path: string]: number;
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

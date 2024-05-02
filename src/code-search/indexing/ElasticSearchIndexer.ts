import { CodebaseIndex, IndexTag, IndexingProgressUpdate } from "./_base/CodebaseIndex";

export class ElasticSearchIndexer implements CodebaseIndex {
	artifactId = "elasticsearch";

	update(tag: IndexTag, repoName: string | undefined): AsyncGenerator<IndexingProgressUpdate> {
		throw new Error("Method not implemented.");
	}
}
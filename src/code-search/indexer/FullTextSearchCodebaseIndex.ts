import { CodebaseIndex, IndexTag, IndexingProgressUpdate } from "./CodebaseIndex";

export class FullTextSearchCodebaseIndex implements CodebaseIndex {
	artifactId: string = "sqliteFts";

	update(tag: IndexTag, repoName: string | undefined): AsyncGenerator<IndexingProgressUpdate, any, unknown> {
		throw new Error("Method not implemented.");
	}
}
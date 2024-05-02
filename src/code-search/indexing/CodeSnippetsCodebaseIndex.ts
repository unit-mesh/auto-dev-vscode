import { CodebaseIndex, IndexTag, IndexingProgressUpdate } from "./_base/CodebaseIndex";

export class CodeSnippetsCodebaseIndex implements CodebaseIndex {
    artifactId = "codeSnippets";

    update(tag: IndexTag, repoName: string | undefined): AsyncGenerator<IndexingProgressUpdate> {
        throw new Error("Method not implemented.");
    }
}
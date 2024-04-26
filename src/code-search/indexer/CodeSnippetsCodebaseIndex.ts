import { CodebaseIndex, IndexTag, IndexingProgressUpdate } from "./CodebaseIndex";

export class CodeSnippetsCodebaseIndex implements CodebaseIndex {
    artifactId = "codeSnippets";

    update(tag: IndexTag, repoName: string | undefined): AsyncGenerator<IndexingProgressUpdate, any, unknown> {
        throw new Error("Method not implemented.");
    }
}
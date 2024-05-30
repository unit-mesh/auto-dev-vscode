import { expect } from 'chai';
import { ParsedFileChange, parseGitLog } from "../../git/GitParser";

describe('GitParser', () => {
	describe('parseGitLog', () => {
		it('should parse git log correctly', () => {
			const log = `diff --git a/test.txt b/test.txt
index 123..456 789
--- a/test.txt
+++ b/test.txt
@@ -1,3 +1,2 @@
-test line 1
 test line 2
+test line 3`;

			const expected: ParsedFileChange[] = [
				{
					filename: 'test.txt',
					status: 'added',
					content: '@@ -1,3 +1,2 @@\n-test line 1\n test line 2\n+test line 3\n'
				}
			];

			const result = parseGitLog(log);
			expect(result).to.deep.equal(expected);
		});

		it('should handle empty log', () => {
			const log = '';
			const expected: ParsedFileChange[] = [];
			const result = parseGitLog(log);
			expect(result).to.deep.equal(expected);
		});

		it('should handle log with no changes', () => {
			const log = `diff --git a/test.txt b/test.txt
index 123..456 789
--- a/test.txt
+++ b/test.txt`;

			const expected: ParsedFileChange[] = [
				{
					filename: 'test.txt',
					status: 'added',
					content: ''
				}
			];

			const result = parseGitLog(log);
			expect(result).to.deep.equal(expected);
		});
	});

	it('really world', () => {
		const log = `diff --git a/src/code-search/retrieval/DefaultRetrieval.ts b/src/code-search/retrieval/DefaultRetrieval.ts
index e9c6640..f630a9e 100644
--- a/src/code-search/retrieval/DefaultRetrieval.ts
+++ b/src/code-search/retrieval/DefaultRetrieval.ts
@@ -95,6 +95,10 @@ export class DefaultRetrieval extends Retrieval {
 \t\t\tretrievalResults.push(...vecResults);
 \t\t}
 
+\t\t/**
+\t\t * Since the official API don't have this feature, this part is commented out
+\t\t * TODO: fix {@link GitAction#getChangeByHashInRepo} to make this works
+\t\t */
 \t\tif (options.withGitChange) {
 \t\t\t// Source: Git
 \t\t\tlet gitResults = await this.retrieveGit(ide.git, new RetrievalQueryTerm(
diff --git a/src/editor/editor-api/scm/GitAction.ts b/src/editor/editor-api/scm/GitAction.ts
index 0f1cd67..345b8f2 100644
--- a/src/editor/editor-api/scm/GitAction.ts
+++ b/src/editor/editor-api/scm/GitAction.ts
@@ -69,7 +69,7 @@ export class GitAction {
 \t}
 
 \tasync getRepositoryChanges(repository: Repository): Promise<string> {
-\t\tlet diffResult = await repository.diff(true) || await repository.diff();
+\t\tlet diffResult: string = await repository.diff(true) || await repository.diff();
 \t\tif (diffResult !== '') {
 \t\t\treturn this.parseGitDiff(repository, diffResult);
 \t\t} else {
@@ -111,7 +111,7 @@ export class GitAction {
 \t\t}
 \t}
 
-\tasync getHistoryCommits(maxEntries: number = 50): Promise<Commit[]> {
+\tasync getHistoryCommits(maxEntries: number = 500): Promise<Commit[]> {
 \t\tconst commits: Commit[] = [];
 \t\tfor (const dir of this.getWorkspaceDirectories()) {
 \t\t\tconst repo = await this.getRepo(vscode.Uri.file(dir));
@@ -126,7 +126,7 @@ export class GitAction {
 \t}
 
 \tasync getChangeByHash(hash: string): Promise<string> {
-\t\tlet diffs = [];
+\t\tlet diffs: string[] = [];
 
 \t\tfor (const dir of this.getWorkspaceDirectories()) {
 \t\t\tconst repo = await this.getRepo(vscode.Uri.file(dir));
@@ -140,6 +140,7 @@ export class GitAction {
 \t\treturn diffs.join("\\n\\n");
 \t}
 
+\t/// todo: make it works
 \tasync getChangeByHashInRepo(repository: Repository, hash: string): Promise<string> {
 \t\tconst commit = await repository.getCommit(hash);
 \t\tif (!commit) {
`;

		const result = parseGitLog(log);
		console.log(result);
		// asert size
		expect(result).to.have.length(2);
	});
});

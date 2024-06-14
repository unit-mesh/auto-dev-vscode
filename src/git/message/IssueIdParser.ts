import { GitCommit } from '../model/GitCommit';

/**
 * Will parse the issue id from the commit message
 */
export class IssueIdParser {
	/**
	 * Parse the issue id from the commit message
	 * @param commitMessage The commit message to parse
	 * @returns The issue id
	 */
	parseIssueId(commitMessage: string): string[] {
		return [];
	}

	/**
	 *
	 */
	fetchCommitByIssueId(issueId: string): GitCommit[] {
		return [];
	}

	/**
	 * Fetch the commit by the issue id
	 */
	fetchCommitBySingleFile(filePath: string): GitCommit[] {
		return [];
	}
}

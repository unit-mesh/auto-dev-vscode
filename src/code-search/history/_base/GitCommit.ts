/**
 * The `GitCommit` interface in TypeScript represents a single commit in a Git repository.
 * It provides a structured way to interact with and manipulate Git commit data.
 */
export interface GitCommit {
	/**
	 * The hash value of the commit. This is a unique identifier for each commit.
	 */
	hash: string;
	/**
	 * The commit message. This is a brief description of the changes made in the commit.
	 */
	message: string;
	/**
	 * An array of strings representing the list of files that were changed in the commit.
	 */
	filesChanged: string[];
}
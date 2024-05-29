import {
	CodebaseIndex,
	IndexTag,
	IndexingProgressUpdate,
	MarkCompleteCallback,
	RefreshIndexResults
} from "./_base/CodebaseIndex";
import { DatabaseConnection } from "../database/SqliteDb";

export class GitVersionHistoryIndex implements CodebaseIndex {
	artifactId: string = "gitVersionHistory";

	private static async _createTables(db: DatabaseConnection) {
		await db.exec(`
		    CREATE TABLE IF NOT EXISTS refs (
		        name TEXT NOT NULL,
		        full_name TEXT NOT NULL,
		        type TEXT NOT NULL,
		        repo TEXT NOT NULL
		    );
		`);

		await db.exec(`
		    CREATE TABLE IF NOT EXISTS commits (
		        commit_id TEXT PRIMARY KEY,
		        title TEXT NOT NULL,
		        message TEXT,
		        name TEXT NOT NULL,
		        email TEXT NOT NULL,
		        datetime DATETIME NOT NULL,
		        repo TEXT NOT NULL
		    );
		`);

		await db.exec(`
		    CREATE TABLE IF NOT EXISTS branches (
		        name TEXT NOT NULL,
		        commit_count INTEGER NOT NULL,
		        is_head BOOLEAN NOT NULL,
		        is_remote BOOLEAN NOT NULL,
		        updated DATETIME NOT NULL,
		        repo TEXT NOT NULL
		    );
		`);

		await db.exec(`
		    CREATE TABLE IF NOT EXISTS diffs (
		        commit_id TEXT NOT NULL,
		        name TEXT NOT NULL,
		        email TEXT NOT NULL,
		        insertions INTEGER NOT NULL,
		        deletions INTEGER NOT NULL,
		        files_changed INTEGER NOT NULL,
		        repo TEXT NOT NULL,
		        FOREIGN KEY (commit_id) REFERENCES commits (commit_id)
		    );
		`);

		await db.exec(`
		    CREATE TABLE IF NOT EXISTS tags (
		        name TEXT NOT NULL,
		        repo TEXT NOT NULL,
		        PRIMARY KEY (name, repo)
		    );
		`);
	}

	update(tag: IndexTag, results: RefreshIndexResults, markComplete: MarkCompleteCallback, repoName: string | undefined): AsyncGenerator<IndexingProgressUpdate, any, unknown> {
		throw new Error("Method not implemented.");
	}
}
import vscode, { Uri } from "vscode";
import * as util from "node:util";
import { Change, Commit, Repository } from "../../../types/git";
import { DiffManager } from "../../diff/DiffManager";

export const asyncExec = util.promisify(require("child_process").exec);

export class GitAction {
	private async _getRepo(forDirectory: vscode.Uri): Promise<Repository | null> {
		// Use the native git extension to get the branch name
		const extension = vscode.extensions.getExtension("vscode.git");
		if (typeof extension === "undefined" || !extension.isActive || typeof vscode.workspace.workspaceFolders === "undefined") {
			return null;
		}

		const git = extension.exports.getAPI(1);
		return git.getRepository(forDirectory);
	}

	async getRepo(forDirectory: vscode.Uri): Promise<Repository | undefined> {
		let repo = await this._getRepo(forDirectory);
		let i = 0;
		while (!repo?.state?.HEAD?.name) {
			await new Promise((resolve) => setTimeout(resolve, 1000));
			i++;
			if (i >= 20) {
				return undefined;
			}
			repo = await this._getRepo(forDirectory);
		}

		return repo;
	}

	async getGitRoot(forDirectory: string): Promise<string | undefined> {
		const repo = await this.getRepo(vscode.Uri.file(forDirectory));
		return repo?.rootUri?.fsPath;
	}

	async getBranch(forDirectory: vscode.Uri): Promise<string> {
		let repo = await this.getRepo(forDirectory);
		if (repo?.state?.HEAD?.name === undefined) {
			try {
				const { stdout } = await asyncExec("git rev-parse --abbrev-ref HEAD", {
					cwd: forDirectory.fsPath,
				});
				return stdout?.trim() || "NONE";
			} catch (e) {
				return "NONE";
			}
		}

		return repo?.state?.HEAD?.name || "NONE";
	}

	async getDiff(): Promise<string> {
		let diffs = [];

		for (const dir of this.getWorkspaceDirectories()) {
			const repo = await this.getRepo(vscode.Uri.file(dir));
			if (!repo) {
				continue;
			}

			diffs.push(await this.getRepositoryChanges(repo));
		}

		return diffs.join("\n\n");
	}

	async getRepositoryChanges(repository: Repository): Promise<string> {
		let diffResult = await repository.diff(true) || await repository.diff();
		if (diffResult !== '') {
			return this.parseGitDiff(repository, diffResult);
		} else {
			return "";
		}
	}

	async parseGitDiff(repository: Repository, diffResult: string): Promise<string> {
		return DiffManager.simplifyDiff(repository, diffResult);
	}

	async getHistoryMessages(repository: Repository) {
		let repositoryHistories = [];
		let userHistories = [];

		let commits = await repository.log({ maxEntries: 10 });
		repositoryHistories.push(...commits.map(commit => commit.message));

		let userName = await repository.getConfig('user.name') ?? await repository.getGlobalConfig('user.name');
		let userCommits = await repository.log({ maxEntries: 10, author: userName });
		userHistories.push(...userCommits.map(commit => commit.message));

		return { repositoryHistories, userHistories };
	}

	getWorkspaceDirectories(): string[] {
		return (
			vscode.workspace.workspaceFolders?.map((folder) => folder.uri.fsPath) ||
			[]
		);
	}

	async getRepoName(uri: Uri) {
		let repo = await this.getRepo(uri);
		if (repo) {
			return repo.state.HEAD?.name;
		} else {
			return "NONE";
		}
	}

	async getAllHistoryCommits(maxEntries: number = 500): Promise<Commit[]> {
		const commits: Commit[] = [];
		for (const dir of this.getWorkspaceDirectories()) {
			const repo = await this.getRepo(vscode.Uri.file(dir));
			if (!repo) {
				continue;
			}

			commits.push(...(await repo.log({ maxEntries: maxEntries })));
		}

		return commits;
	}

	async getChangeByHash(hash: string): Promise<string> {
		let diffs = [];

		for (const dir of this.getWorkspaceDirectories()) {
			const repo = await this.getRepo(vscode.Uri.file(dir));
			if (!repo) {
				continue;
			}

			diffs.push(await this.getChangeByHashInRepo(repo, hash));
		}

		return diffs.join("\n\n");
	}

	async getChangeByHashInRepo(repository: Repository, hash: string): Promise<string> {
		const commit = await repository.getCommit(hash);
		if (!commit) {
			throw new Error(`Commit with hash ${hash} not found in repository`);
		}

		const diff = await repository.diffWithHEAD(commit.hash);
		return this.parseGitDiff(repository, diff);
	}
}

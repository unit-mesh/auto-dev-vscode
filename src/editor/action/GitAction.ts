import vscode from "vscode";
import * as util from "node:util";

const asyncExec = util.promisify(require("child_process").exec);

export class GitAction {
	private async _getRepo(forDirectory: vscode.Uri): Promise<any | undefined> {
		// Use the native git extension to get the branch name
		const extension = vscode.extensions.getExtension("vscode.git");
		if (
			typeof extension === "undefined" ||
			!extension.isActive ||
			typeof vscode.workspace.workspaceFolders === "undefined"
		) {
			return undefined;
		}

		const git = extension.exports.getAPI(1);
		return git.getRepository(forDirectory);
	}

	async getRepo(forDirectory: vscode.Uri): Promise<any | undefined> {
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

	async getBranch(forDirectory: vscode.Uri) {
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

			diffs.push((await repo.getDiff()).join("\n"));
		}

		return diffs.join("\n\n");
	}

	getWorkspaceDirectories(): string[] {
		return (
			vscode.workspace.workspaceFolders?.map((folder) => folder.uri.fsPath) ||
			[]
		);
	}
}
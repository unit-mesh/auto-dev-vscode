import { IdeAction } from "./IdeAction";
import * as vscode from "vscode";
import path from "path";
import { TextDecoder } from "node:util";

import { asyncExec, GitAction } from "../../git/GitAction";
import { traverseDirectory } from "../util/traverseDirectory";
import { defaultIgnoreFile } from "../util/ignore";

export class VSCodeAction implements IdeAction {
	git: GitAction = new GitAction();

	async runCommand(command: string): Promise<void> {
		if (vscode.window.terminals.length) {
			vscode.window.terminals[0].show();
			vscode.window.terminals[0].sendText(command, false);
		} else {
			const terminal = vscode.window.createTerminal();
			terminal.show();
			terminal.sendText(command, false);
		}
	}

	async getTerminalContents(commands: number = -1): Promise<string> {
		const tempCopyBuffer = await vscode.env.clipboard.readText();
		if (commands < 0) {
			await vscode.commands.executeCommand("workbench.editor-api.terminal.selectAll");
		} else {
			for (let i = 0; i < commands; i++) {
				await vscode.commands.executeCommand("workbench.editor-api.terminal.selectToPreviousCommand");
			}
		}
		await vscode.commands.executeCommand("workbench.editor-api.terminal.copySelection");
		await vscode.commands.executeCommand("workbench.editor-api.terminal.clearSelection");
		const terminalContents = await vscode.env.clipboard.readText();
		await vscode.env.clipboard.writeText(tempCopyBuffer);

		if (tempCopyBuffer === terminalContents) {
			// This means there is no terminal open to select text from
			return "";
		}
		return terminalContents;
	}

	getWorkspaceDirectories(): string[] {
		return (vscode.workspace.workspaceFolders?.map((folder) => folder.uri.fsPath) || []);
	}

	private static MAX_BYTES = 100000;

	getAbsolutePath(filepath: string): string {
		const workspaceDirectories = this.getWorkspaceDirectories();
		if (!path.isAbsolute(filepath) && workspaceDirectories.length === 1) {
			return path.join(workspaceDirectories[0], filepath);
		} else {
			return filepath;
		}
	}

	async readFile(filepath: string): Promise<string> {
		try {
			filepath = this.getAbsolutePath(filepath);
			const uri = this.uriFromFilePath(filepath);

			// Check first whether it's an open document
			const openTextDocument = vscode.workspace.textDocuments.find(
				(doc) => doc.uri.fsPath === uri.fsPath,
			);
			if (openTextDocument !== undefined) {
				return openTextDocument.getText();
			}

			const fileStats = await vscode.workspace.fs.stat(
				this.uriFromFilePath(filepath),
			);
			if (fileStats.size > 10 * VSCodeAction.MAX_BYTES) {
				return "";
			}

			const bytes = await vscode.workspace.fs.readFile(uri);

			// Truncate the buffer to the first MAX_BYTES
			const truncatedBytes = bytes.slice(0, VSCodeAction.MAX_BYTES);
			return new TextDecoder().decode(truncatedBytes);
		} catch {
			return "";
		}
	}

	uriFromFilePath(filepath: string): vscode.Uri {
		if (vscode.env.remoteName) {
			if (this.isWindowsLocalButNotRemote()) {
				filepath = this.windowsToPosix(filepath);
			}
			return vscode.Uri.parse(`vscode-remote://${vscode.env.remoteName}${filepath}`);
		} else {
			return vscode.Uri.file(filepath);
		}
	}

	isWindowsLocalButNotRemote(): boolean {
		return (
			vscode.env.remoteName !== undefined &&
			["wsl", "ssh-remote", "dev-container", "attached-container"].includes(vscode.env.remoteName,) &&
			process.platform === "win32"
		);
	}

	getPathSep(): string {
		return this.isWindowsLocalButNotRemote() ? "/" : path.sep;
	}

	windowsToPosix(windowsPath: string): string {
		let posixPath = windowsPath.split("\\").join("/");
		if (posixPath[1] === ":") {
			posixPath = posixPath.slice(2);
		}

		return posixPath;
	}

	async getBranch(dir: string): Promise<string> {
		return this.getBranchForUri(vscode.Uri.file(dir));
	}

	async getBranchForUri(forDirectory: vscode.Uri) {
		let repo = await this.git.getRepo(forDirectory);
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

	/**
	 * `getStats` is an asynchronous method that retrieves the last modified time of all files in a given directory.
	 *
	 * @param directory A string representing the directory path from which to retrieve file statistics.
	 *
	 * @returns A Promise that resolves to an object. The object's keys are the file paths and the values are the last modified time (in milliseconds since the UNIX epoch) of each file.
	 *
	 * The method works by first listing all the contents of the workspace directory using the `listWorkspaceContents` method. It then maps over each file in the directory, retrieves its stats using the `vscode.workspace.fs.stat` method, and adds an entry to the `pathToLastModified` object with the file path as the key and the last modified time as the value.
	 *
	 * Note: The `vscode.workspace.fs.stat` method returns a `FileStat` object, from which the `mtime` property is extracted. The `mtime` property represents the last modified time of the file.
	 *
	 * @throws This method may throw an error if the `listWorkspaceContents` method or the `vscode.workspace.fs.stat` method fails.
	 *
	 * @async
	 */
	async getStats(directory: string): Promise<{ [path: string]: number }> {
		const files = await this.listWorkspaceContents(directory);
		const pathToLastModified: { [path: string]: number } = {};
		await Promise.all(
			files.map(async (file) => {
				let stat = await vscode.workspace.fs.stat(this.uriFromFilePath(file));
				pathToLastModified[file] = stat.mtime;
			}),
		);

		return pathToLastModified;
	}

	async listWorkspaceContents(directory?: string): Promise<string[]> {
		if (directory) {
			return await this.getDirectoryContents(directory, true);
		} else {
			const contents = await Promise.all(
				this.getWorkspaceDirectories()
					.map((dir) => this.getDirectoryContents(dir, true)),
			);
			return contents.flat();
		}
	}

	async getDirectoryContents(
		directory: string,
		recursive: boolean,
	): Promise<string[]> {
		if (!recursive) {
			return (
				await vscode.workspace.fs.readDirectory(this.uriFromFilePath(directory))
			)
				.filter(([name, type]) => {
					type === vscode.FileType.File && !defaultIgnoreFile.ignores(name);
				})
				.map(([name, type]) => path.join(directory, name));
		}

		const allFiles: string[] = [];
		const gitRoot = await this.git.getGitRoot(directory);
		let onlyThisDirectory = undefined;
		if (gitRoot) {
			onlyThisDirectory = directory.slice(gitRoot.length).split(path.sep);
			if (onlyThisDirectory[0] === "") {
				onlyThisDirectory.shift();
			}
		}
		for await (const file of traverseDirectory(
			gitRoot ?? directory,
			[],
			true,
			gitRoot === directory ? undefined : onlyThisDirectory,
		)) {
			allFiles.push(file);
		}
		return allFiles;
	}

	getRepoName(dir: string): Promise<string | undefined> {
		return this.git.getRepoName(vscode.Uri.file(dir));
	}
}

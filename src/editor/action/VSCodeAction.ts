import { IdeAction } from "./IdeAction";
import * as vscode from "vscode";
import path from "path";
import { TextDecoder } from "node:util";

import { GitAction } from "./GitAction";

export class VSCodeAction implements IdeAction {
  gitAction: GitAction = new GitAction();

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

	//   getTerminalContents: [undefined, string];
	async getTerminalContents(commands: number = -1): Promise<string> {
		const tempCopyBuffer = await vscode.env.clipboard.readText();
		if (commands < 0) {
			await vscode.commands.executeCommand(
				"workbench.action.terminal.selectAll"
			);
		} else {
			for (let i = 0; i < commands; i++) {
				await vscode.commands.executeCommand(
					"workbench.action.terminal.selectToPreviousCommand"
				);
			}
		}
		await vscode.commands.executeCommand(
			"workbench.action.terminal.copySelection"
		);
		await vscode.commands.executeCommand(
			"workbench.action.terminal.clearSelection"
		);
		const terminalContents = await vscode.env.clipboard.readText();
		await vscode.env.clipboard.writeText(tempCopyBuffer);

		if (tempCopyBuffer === terminalContents) {
			// This means there is no terminal open to select text from
			return "";
		}
		return terminalContents;
	}

	getWorkspaceDirectories(): string[] {
		return (
			vscode.workspace.workspaceFolders?.map((folder) => folder.uri.fsPath) ||
			[]
		);
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
			const contents = new TextDecoder().decode(truncatedBytes);
			return contents;
		} catch {
			return "";
		}
	}

	uriFromFilePath(filepath: string): vscode.Uri {
		if (vscode.env.remoteName) {
			if (this.isWindowsLocalButNotRemote()) {
				filepath = this.windowsToPosix(filepath);
			}
			return vscode.Uri.parse(
				`vscode-remote://${vscode.env.remoteName}${filepath}`,
			);
		} else {
			return vscode.Uri.file(filepath);
		}
	}

	isWindowsLocalButNotRemote(): boolean {
		return (
			vscode.env.remoteName !== undefined &&
			["wsl", "ssh-remote", "dev-container", "attached-container"].includes(
				vscode.env.remoteName,
			) &&
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
    // posixPath = posixPath.replace(" ", "\\ ");
    return posixPath;
  }
}

import { IdeAction } from "./IdeAction";
import * as vscode from "vscode";
import path from "path";
import { TextDecoder } from "node:util";

import { asyncExec, GitAction } from "./scm/GitAction";
import { traverseDirectory } from "../util/traverseDirectory";
import { defaultIgnoreFile } from "../util/ignore";

export class VSCodeAction implements IdeAction {
	git: GitAction = new GitAction();

	/**
	 * 执行命令
	 *
	 * @param command 命令字符串
	 * @returns Promise<void> 无返回值
	 */
	async runCommand(command: string): Promise<void> {
		// 如果有已打开的终端
		if (vscode.window.terminals.length) {
			// 显示第一个终端
			vscode.window.terminals[0].show();
			// 在终端中发送命令
			vscode.window.terminals[0].sendText(command, false);
		} else {
			// 创建一个新的终端
			const terminal = vscode.window.createTerminal();
			// 显示新创建的终端
			terminal.show();
			// 在新创建的终端中发送命令
			terminal.sendText(command, false);
		}
	}

	//   getTerminalContents: [undefined, string];
	/**
	 * 获取终端内容
	 *
	 * @param commands 要选择的命令数量，默认为-1，表示选择所有内容
	 * @returns 返回终端内容的Promise对象
	 */
	async getTerminalContents(commands: number = -1): Promise<string> {
		// 读取剪贴板的内容到临时变量tempCopyBuffer
		const tempCopyBuffer = await vscode.env.clipboard.readText();

		// 如果commands小于0
		if (commands < 0) {
			// 执行命令选择终端中的所有内容
			await vscode.commands.executeCommand(
				"workbench.editor-api.terminal.selectAll"
			);
		} else {
			// 遍历执行命令选择上一个命令的内容，循环次数为commands
			for (let i = 0; i < commands; i++) {
				await vscode.commands.executeCommand(
					"workbench.editor-api.terminal.selectToPreviousCommand"
				);
			}
		}

		// 执行命令复制选中的终端内容
		await vscode.commands.executeCommand(
			"workbench.editor-api.terminal.copySelection"
		);

		// 执行命令清除选中的终端内容
		await vscode.commands.executeCommand(
			"workbench.editor-api.terminal.clearSelection"
		);

		// 读取剪贴板的内容到terminalContents变量
		const terminalContents = await vscode.env.clipboard.readText();

		// 将临时变量tempCopyBuffer的内容写回剪贴板
		await vscode.env.clipboard.writeText(tempCopyBuffer);

		// 如果临时变量tempCopyBuffer与终端内容terminalContents相同
		if (tempCopyBuffer === terminalContents) {
			// 这意味着没有打开的终端可以从中选择文本
			return "";
		}

		// 返回终端内容
		return terminalContents;
	}

	/**
	 * 获取工作区目录列表
	 *
	 * @returns 返回工作区目录的路径数组，若获取失败则返回空数组
	 */
	getWorkspaceDirectories(): string[] {
		return (vscode.workspace.workspaceFolders?.map((folder) => folder.uri.fsPath) || []);
	}

	private static MAX_BYTES = 100000;

	/**
	 * 获取文件路径的绝对路径
	 *
	 * @param filepath 文件路径
	 * @returns 返回绝对路径字符串
	 */
	getAbsolutePath(filepath: string): string {
		const workspaceDirectories = this.getWorkspaceDirectories();
		if (!path.isAbsolute(filepath) && workspaceDirectories.length === 1) {
			return path.join(workspaceDirectories[0], filepath);
		} else {
			return filepath;
		}
	}

	/**
	 * 异步读取文件内容
	 *
	 * @param filepath 文件路径
	 * @returns 返回文件内容的Promise对象
	 */
	async readFile(filepath: string): Promise<string> {
		try {
			// 获取文件的绝对路径
			filepath = this.getAbsolutePath(filepath);
			// 将文件路径转换为 URI
			const uri = this.uriFromFilePath(filepath);

			// 首先检查是否是已打开的文档
			const openTextDocument = vscode.workspace.textDocuments.find(
				(doc) => doc.uri.fsPath === uri.fsPath,
			);
			if (openTextDocument !== undefined) {
				// 如果是已打开的文档，直接返回文档内容
				return openTextDocument.getText();
			}

			// 获取文件状态信息
			const fileStats = await vscode.workspace.fs.stat(
				this.uriFromFilePath(filepath),
			);
			// 如果文件大小超过最大限制，返回空字符串
			if (fileStats.size > 10 * VSCodeAction.MAX_BYTES) {
				return "";
			}

			// 读取文件内容
			const bytes = await vscode.workspace.fs.readFile(uri);

			// 截取缓冲区的前 MAX_BYTES 字节
			const truncatedBytes = bytes.slice(0, VSCodeAction.MAX_BYTES);
			// 将字节解码为字符串
			const contents = new TextDecoder().decode(truncatedBytes);
			// 返回文件内容
			return contents;
		} catch {
			// 如果发生异常，返回空字符串
			return "";
		}
	}

	/**
	 * 根据文件路径获取vscode.Uri对象
	 *
	 * @param filepath 文件路径
	 * @returns 返回一个vscode.Uri对象
	 */
	uriFromFilePath(filepath: string): vscode.Uri {
		// 如果当前环境是远程环境
		if (vscode.env.remoteName) {
			// 如果当前环境是Windows本地环境但不是远程环境
			if (this.isWindowsLocalButNotRemote()) {
				// 将文件路径从Windows格式转换为POSIX格式
				filepath = this.windowsToPosix(filepath);
			}
			// 根据远程环境名称和文件路径构造VSCode的URI对象
			return vscode.Uri.parse(
				`vscode-remote://${vscode.env.remoteName}${filepath}`,
			);
		} else {
			// 如果当前环境不是远程环境，则构造本地文件的VSCode URI对象
			return vscode.Uri.file(filepath);
		}
	}

	/**
	 * 判断当前环境是否为 Windows 本地环境且非远程环境。
	 *
	 * @returns 返回一个布尔值，表示当前环境是否为 Windows 本地环境且非远程环境。
	 */
	isWindowsLocalButNotRemote(): boolean {
		return (
			vscode.env.remoteName !== undefined &&
			["wsl", "ssh-remote", "dev-container", "attached-container"].includes(
				vscode.env.remoteName,
			) &&
			process.platform === "win32"
		);
	}

	/**
	 * 获取路径分隔符
	 *
	 * @returns 如果当前环境是本地Windows环境但不是远程Windows环境，返回 "/"；否则返回 path.sep
	 */
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

	/**
	 * 获取指定目录下的分支信息
	 *
	 * @param dir 指定的目录路径
	 * @returns 返回分支信息的字符串
	 */
	async getBranch(dir: string): Promise<string> {
		return this.getBranchForUri(vscode.Uri.file(dir));
	}

	/**
	 * 根据目录URI获取分支名
	 *
	 * @param forDirectory 目录URI
	 * @returns 分支名，如果获取失败则返回"NONE"
	 */
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
	 * 获取指定目录下所有文件的最后修改时间
	 *
	 * @param directory 目录路径
	 * @returns 返回文件路径到最后修改时间的映射对象
	 */
	async getStats(directory: string): Promise<{ [path: string]: number }> {
		// 获取工作区第一个文件夹的 URI scheme
		const scheme = vscode.workspace.workspaceFolders?.[0].uri.scheme;

		// 列出目录中的文件列表
		const files = await this.listWorkspaceContents(directory);

		// 创建一个对象，用于存储每个文件的最后修改时间
		const pathToLastModified: { [path: string]: number } = {};

		await Promise.all(
			files.map(async (file) => {
				// 获取文件的统计信息
				let stat = await vscode.workspace.fs.stat(this.uriFromFilePath(file));
				// 将文件路径和最后修改时间存入对象中
				pathToLastModified[file] = stat.mtime;
			}),
		);

		// 返回包含文件最后修改时间的对象
		return pathToLastModified;
	}

	/**
	 * 列出工作区的内容
	 *
	 * @param directory 目录路径，可选
	 * @returns 返回工作区内容的文件路径数组
	 */
	async listWorkspaceContents(directory?: string): Promise<string[]> {
		// 如果提供了目录参数
		if (directory) {
			// 调用获取目录内容的函数，并返回结果
			return await this.getDirectoryContents(directory, true);
		} else {
			// 获取工作区所有目录
			const contents = await Promise.all(
				this.getWorkspaceDirectories()
					// 对每个目录调用获取目录内容的函数，并返回结果的数组
					.map((dir) => this.getDirectoryContents(dir, true)),
			);
			// 将所有目录的内容合并成一个数组并返回
			return contents.flat();
		}
	}

	/**
	 * 异步获取目录内容
	 *
	 * @param directory 目录路径
	 * @param recursive 是否递归搜索子目录
	 * @returns 目录内容（文件路径数组）
	 */
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

	/**
	 * 获取仓库名称
	 *
	 * @param dir 仓库目录
	 * @returns 仓库名称，若无法获取则返回 undefined
	 */
	getRepoName(dir: string): Promise<string | undefined> {
		return this.git.getRepoName(vscode.Uri.file(dir));
	}
}

/**
 * Copyright (c) 2015 DonJayamanne
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
import vscode, { extensions, Uri } from "vscode";
import * as util from "node:util";
import { Writable } from "node:stream";
import { spawn } from "node:child_process";
import * as iconv from 'iconv-lite';

import { API, Change, Commit, GitExtension, Repository } from "../../../types/git";
import { DiffManager } from "../../diff/DiffManager";

export const asyncExec = util.promisify(require("child_process").exec);

export class StopWatch {
	private started = new Date().getTime();
	public get elapsedTime() {
		return new Date().getTime() - this.started;
	}
}

function decode(buffers: Buffer, encoding: string): string {
	return iconv.decode(buffers, encoding);
}

const DEFAULT_ENCODING = 'utf8';
const isWindows = /^win/.test(process.platform);

export class GitAction {
	public gitApi: Promise<API>;
	private gitExecutablePath: Promise<string>;

	constructor() {
		// based on: https://github.com/DonJayamanne/gitHistoryVSCode/blob/main/src/adapter/exec/gitCommandExec.ts
		this.gitApi = new Promise(async resolve => {
			const extension = extensions.getExtension<GitExtension>('vscode.git');
			if (!extension?.isActive) {
				await extension?.activate();
			}

			const api = extension!.exports.getAPI(1);
			// Wait for the API to get initialized.
			api.onDidChangeState(() => {
				if (api.state === 'initialized') {
					resolve(api);
				}
			});
			if (api.state === 'initialized') {
				resolve(api);
			}
		});

		this.gitExecutablePath = this.gitApi.then(api => api.git.path);
	}

	private async _getRepo(forDirectory: vscode.Uri): Promise<Repository | null> {
		return (await this.gitApi).getRepository(forDirectory);
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
		let diffResult: string = await repository.diff(true) || await repository.diff();
		if (diffResult !== '') {
			return this.parseGitDiff(repository, diffResult);
		} else {
			return "";
		}
	}

	async parseGitDiff(repository: Repository, diffResult: string): Promise<string> {
		return DiffManager.simplifyDiff(repository, diffResult);
	}

	public exec(cwd: string, ...args: string[]): Promise<string>;
	// tslint:disable-next-line:unified-signatures
	public exec(options: { cwd: string; shell?: boolean }, ...args: string[]): Promise<string>;
	public exec(options: { cwd: string; encoding: 'binary' }, destination: Writable, ...args: string[]): Promise<void>;
	// tslint:disable-next-line:no-any
	public async exec(options: any, ...args: any[]): Promise<any> {
		let gitPath = await this.gitExecutablePath;
		gitPath = isWindows ? gitPath.replace(/\\/g, '/') : gitPath;
		const childProcOptions = typeof options === 'string' ? { cwd: options, encoding: DEFAULT_ENCODING } : options;
		if (typeof childProcOptions.encoding !== 'string' || childProcOptions.encoding.length === 0) {
			childProcOptions.encoding = DEFAULT_ENCODING;
		}
		const binaryOuput = childProcOptions.encoding === 'binary';
		const destination: Writable = binaryOuput ? args.shift() : undefined;
		const gitPathCommand = childProcOptions.shell && gitPath.indexOf(' ') > 0 ? `"${gitPath}"` : gitPath;
		const stopWatch = new StopWatch();
		const gitShow = spawn(gitPathCommand, args, childProcOptions);

		let stdout: Buffer = new Buffer('');
		let stderr: Buffer = new Buffer('');

		if (binaryOuput) {
			gitShow.stdout.pipe(destination);
		} else {
			gitShow.stdout.on('data', data => {
				stdout = Buffer.concat([stdout, data as Buffer]);
			});
		}

		gitShow.stderr.on('data', data => {
			stderr = Buffer.concat([stderr, data as Buffer]);
		});

		return new Promise<any>((resolve, reject) => {
			gitShow.on('error', reject);
			gitShow.on('close', code => {
				if (code === 0) {
					const stdOut = binaryOuput ? undefined : decode(stdout, childProcOptions.encoding);
					resolve(stdOut);
				} else {
					const stdErr = binaryOuput ? undefined : decode(stderr, childProcOptions.encoding);
					reject({ code, error: stdErr });
				}
			});
		});
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

	async getHistoryCommits(maxEntries: number = 500): Promise<Commit[]> {
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
		let diffs: string[] = [];

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

		return this.exec(repository.rootUri.fsPath, 'show', hash);
	}
}

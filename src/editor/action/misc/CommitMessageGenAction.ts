import { Git, Repository } from "../../../types/git";
import vscode from "vscode";

export class CommitMessageGenAction {
	extension: vscode.Extension<Git>;

	constructor(extension?: vscode.Extension<Git>) {
		// this.extension = vscode.extensions.getExtension('vscode.git')
		if (extension) {
			this.extension = extension;
		} else {
			this.extension = vscode.extensions.getExtension('vscode.git')!!;
		}
	}

	getRepository() {
		// todos
	}

	async historyMessages(repository: Repository) {
		let repositoryMsgs = [];
		let userMsgs = [];

		let commits = await repository.log({ maxEntries: 10 });
		repositoryMsgs.push(...commits.map(commit => commit.message));

		let userName = await repository.getConfig('user.name') ?? await repository.getGlobalConfig('user.name');
		let userCommits = await repository.log({ maxEntries: 10, author: userName });
		userMsgs.push(...userCommits.map(commit => commit.message));

		return { repositoryMsgs, userMsgs };
	}

	// todo: compare to Intellij Version.
	handleDiff() {

	}
}
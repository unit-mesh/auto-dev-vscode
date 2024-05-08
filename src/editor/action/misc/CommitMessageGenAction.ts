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

	// todo: compare to Intellij Version.
	handleDiff() {

	}
}
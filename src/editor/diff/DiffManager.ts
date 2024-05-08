import path from "path";
import vscode from "vscode";
import { Repository } from "../../types/git";

export class DiffManager {
	showDiff() {
		// todo
	}

	static simplifyDiff(diffResult: string) {
		return diffResult;
	}

	/// here is a copilot chat sample
	async parseGitDiff(gitRoot: Repository, diffString: string) {
		let parsedDiffs = [];
		let parseDiffBlock = (diffBlock: string) => {
			let match = /^---\s(.*)\\n\+\+\+\s(.*)$/m.exec(diffBlock);
			if (!match || match.length !== 3) {
				return { originalUri: void 0, modifiedUri: void 0 };
			}

			let originalPath = match[1] === '/dev/null' ? void 0 : vscode.Uri.file(path.join(gitRoot.rootUri.fsPath, match[1].substring(2)));
			let modifiedPath = match[2] === '/dev/null' ? void 0 : vscode.Uri.file(path.join(gitRoot.rootUri.fsPath, match[2].substring(2)));
			return { originalUri: originalPath, modifiedUri: modifiedPath };
		};
		let currentIndex = 0;
		let match;
		let diffRegex = /^diff --git a\/(.+?) b\/(.+?)$/gm;

		do {
			if (match = diffRegex.exec(diffString), match === null) {
				break;
			}
			if (currentIndex < match.index) {
				let diffBlock = diffString.substring(currentIndex, match.index),
					{ originalUri: originalPath, modifiedUri: modifiedPath } = parseDiffBlock(diffBlock);

				parsedDiffs.push({ diff: diffBlock, originalUri: originalPath, modifiedUri: modifiedPath });
			}
			currentIndex = match.index;
		} while (true);

		if (currentIndex < diffString.length) {
			let diffBlock = diffString.substring(currentIndex),
				{ originalUri: originalPath, modifiedUri: modifiedPath } = parseDiffBlock(diffBlock);

			parsedDiffs.push({ diff: diffBlock, originalUri: originalPath, modifiedUri: modifiedPath });
		}

		return parsedDiffs;
	}
}

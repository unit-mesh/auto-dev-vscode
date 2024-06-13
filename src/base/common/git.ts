import { extensions, Uri } from 'vscode';

import { GitExtension } from '../../types/git';

export function getGitExtensionAPI() {
	// See https://github.com/microsoft/vscode/blob/main/extensions/git/README.md
	const gitExtension = extensions.getExtension<GitExtension>('vscode.git')?.exports;

	if (!gitExtension) {
		return;
	}

	const git = gitExtension.getAPI(1);

	if (0 === git.repositories.length) {
		return;
	}

	return git;
}

export function getRepository(uri: Uri) {
	const api = getGitExtensionAPI();
	return api?.getRepository(uri);
}

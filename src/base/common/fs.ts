import { inject, injectable } from 'inversify';
import { Uri, workspace } from 'vscode';

import { IExtensionUri } from './configuration/context';

@injectable()
export class WorkspaceFileSystem {
	constructor(
		@inject(IExtensionUri)
		private extensionUri: Uri,
	) {}

	readFile(path: string | Uri) {
		return workspace.fs.readFile(this.filePathToURI(path)) as Promise<Uint8Array>;
	}

	stat(path: string | Uri) {
		return workspace.fs.stat(this.filePathToURI(path));
	}

	filePathToURI(path: string | Uri) {
		if (typeof path === 'string') {
			return this.joinPath(path);
		}

		return path;
	}

	joinPath(...pathSegments: string[]) {
		return Uri.joinPath(this.extensionUri, ...pathSegments);
	}
}

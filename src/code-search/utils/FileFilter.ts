const ignore = require('ignore');
const fs = require('fs');
const isBinaryFile = require("isbinaryfile").isBinaryFile;

import { Uri, WorkspaceFolder } from 'vscode';

/**
 * Example usage:
 * ```javascript
 * // Example usage:
 * const filter = new FileFilter();
 * const uri = Uri.file('/path/to/file.jpg');
 * const workspace = {
 * 	getWorkspaceFolders: () => [],
 * };
 * const includeUntitled = false;
 * console.log(filter.shouldIncludeFile(uri, workspace, includeUntitled));
 * ```
 */
class FileFilter {
	isIgnored(uri: Uri, workspaceFolder: WorkspaceFolder | undefined) {
		let ignored = ignore()
			.add(fs.readFileSync(".gitignore").toString());

		return ignored.ignores(uri.path);
	}


	private getFileExtension(uri: Uri): string {
		const pathSegments = uri.path.split('/');
		const fileName = pathSegments.pop() || '';
		const dotIndex = fileName.lastIndexOf('.');
		return dotIndex !== -1 ? fileName.substring(dotIndex + 1) : '';
	}

	async isBinaryFile(data: any, length: number) {
		return await isBinaryFile(data, length);
	}
}

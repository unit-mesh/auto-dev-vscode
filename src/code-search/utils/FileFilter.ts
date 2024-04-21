import { Uri, WorkspaceFolder } from 'vscode';
import fs from "fs";
import * as util from "node:util"; // Import appropriate types from 'vscode'

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
	private readonly MAX_FILE_SIZE: number = 100000;
	private readonly MAX_IMAGE_SIZE: number = 1 * 1024 * 1024;
	private readonly SUPPORTED_EXTENSIONS: Set<string> = new Set(['jpg', 'jpeg', 'jpe', 'png', 'gif', 'bmp', 'tif', 'tiff', 'tga', 'ico', 'webp', 'svg', 'eps', 'heif', 'heic', 'pdf', 'raw', 'mp4', 'm4v', 'mkv', 'webm', 'mov', 'avi', 'wmv', 'flv', 'mp3', 'wav', 'm4a', 'flac', 'ogg', 'wma', 'weba', 'aac', '7z', 'bz2', 'gz', 'rar', 'tar', 'xz', 'zip', 'vsix', 'db', 'bin', 'dat', 'hex', 'map', 'wasm', 'pyc', 'pdb', 'sym', 'git']);
	private readonly IGNORED_DIRECTORIES: string[] = ['node_modules', 'out', 'dist', '.git', '.yarn', '.npm', '.venv', 'foo.asar', '.vscode-test'];
	private readonly IGNORED_FILES: string[] = ['.DS_Store', 'Thumbs.db', 'package-lock.json', 'yarn.lock'];
	private readonly SPECIAL_SCHEMES: string[] = ['vscode', 'vscode-userdata', 'output', 'inmemory', 'private', 'git'];

	shouldIncludeFile(uri: Uri, workspace: {
		getWorkspaceFolders(): readonly WorkspaceFolder[]
	}, includeUntitled: boolean): boolean {
		if (this.SPECIAL_SCHEMES.includes(uri.scheme) || (includeUntitled && !['file', 'untitled'].includes(uri.scheme) && !workspace.getWorkspaceFolders()?.some(folder => uri.scheme === folder.uri.scheme))) {
			return false;
		}

		const fileExtension = this.getFileExtension(uri);
		const fileName = uri.path.split('/').pop()?.toLowerCase() || '';

		return !(this.SUPPORTED_EXTENSIONS.has(fileExtension) || this.IGNORED_FILES.includes(fileName) || uri.path.toLowerCase().split(/[/\\]/g).some(segment => this.IGNORED_DIRECTORIES.includes(segment)));
	}

	private getFileExtension(uri: Uri): string {
		const pathSegments = uri.path.split('/');
		const fileName = pathSegments.pop() || '';
		const dotIndex = fileName.lastIndexOf('.');
		return dotIndex !== -1 ? fileName.substring(dotIndex + 1) : '';
	}


	async isBinaryFile(input: any, length: number) {
		var statAsync = util.promisify(fs.stat);
		var openAsync = util.promisify(fs.open);
		var closeAsync = util.promisify(fs.close);
		var readAsync = util.promisify(fs.read);
		var bufferSize = 512;


		if (this.isString(input)) {
			const fileStats = await statAsync(input);
			if (!fileStats.isFile()) {
				throw new Error('Not a file');
			}

			const fileDescriptor = await openAsync(input, 'r');
			try {
				const buffer = Buffer.alloc(bufferSize);
				const read = await readAsync(fileDescriptor, buffer, 0, bufferSize, 0);
				await closeAsync(fileDescriptor);
				return this.processBinaryData(buffer, read.bytesRead);
			} catch (error) {
				await closeAsync(fileDescriptor);
				throw error;
			}
		} else {
			return this.processBinaryData(input, length === undefined ? input.length : length);
		}
	}


	isString(value: any) {
		return typeof value === 'string' || value instanceof String;
	}

	private processBinaryData(buffer: Buffer, bytesRead: any) {
		// todo
	}
}

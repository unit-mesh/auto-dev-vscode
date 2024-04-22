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
		const statAsync = util.promisify(fs.stat);
		const openAsync = util.promisify(fs.open);
		const closeAsync = util.promisify(fs.close);
		const readAsync = util.promisify(fs.read);
		const bufferSize = 512;

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
				return !this.isTextFile(buffer, read.bytesRead);
			} catch (error) {
				await closeAsync(fileDescriptor);
				throw error;
			}
		} else {
			return !this.isTextFile(input, length === undefined ? input.length : length);
		}
	}


	isString(value: any) {
		return typeof value === 'string' || value instanceof String;
	}

	MAX_BUFFER_SIZE: number = 512; // 缓冲区大小

	isTextFile(buffer: Buffer, inputLength: number): boolean {
		if (inputLength === 0) {
			return false;
		}

		const length = Math.min(inputLength, this.MAX_BUFFER_SIZE);

		// 检查是否存在 BOM 或者二进制文件标志
		if (this.hasBOM(buffer, length) || this.hasBinarySignature(buffer, length)) {
			return false;
		}

		// 检查 PDF 文件头
		if (this.startsWithPDFHeader(buffer, length)) {
			return true;
		}

		// 检查 UTF-16 BOM
		if (this.hasUTF16BOM(buffer, length)) {
			return false;
		}

		// 检查是否包含控制字符或非 ASCII 字符
		if (this.containsNonAsciiSequence(buffer, length)) {
			return true;
		}

		// 如果以上条件都不满足，则判断为文本文件
		return true;
	}

	// 检查是否存在 BOM
	hasBOM(buffer: Buffer, length: number): boolean {
		return (length >= 3 && buffer[0] === 239 && buffer[1] === 187 && buffer[2] === 191);
	}

	// 检查是否存在二进制文件标志
	hasBinarySignature(buffer: Buffer, length: number): boolean {
		return (
			(length >= 4 && buffer[0] === 0 && buffer[1] === 0 && buffer[2] === 254 && buffer[3] === 255) ||
			(length >= 4 && buffer[0] === 255 && buffer[1] === 254 && buffer[2] === 0 && buffer[3] === 0) ||
			(length >= 4 && buffer[0] === 132 && buffer[1] === 49 && buffer[2] === 149 && buffer[3] === 51)
		);
	}

	// 检查 PDF 文件头
	startsWithPDFHeader(buffer: Buffer, length: number): boolean {
		return (length >= 5 && buffer.slice(0, 5).toString() === '%PDF-');
	}

	// 检查 UTF-16 BOM
	hasUTF16BOM(buffer: Buffer, length: number): boolean {
		return ((length >= 2 && buffer[0] === 254 && buffer[1] === 255) || (length >= 2 && buffer[0] === 255 && buffer[1] === 254));
	}

	// 检查是否包含连续的非 ASCII 字符序列
	containsNonAsciiSequence(data: Buffer, length: number): boolean {
		let reader = new ByteReader(data, length);
		let nonAsciiSequenceCount = 0;
		while (!reader.isEOF() && !reader.hasError()) {
			if (reader.currentByte() < 0) {
				nonAsciiSequenceCount++;
			} else {
				nonAsciiSequenceCount = 0;
			}
			reader.advance();
		}
		return nonAsciiSequenceCount > 0;
	}
}

class ByteReader {
	buffer: Buffer;
	size: number;
	offset: number;
	error: boolean;

	constructor(buffer: Buffer, size: number) {
		this.buffer = buffer;
		this.size = size;
		this.offset = 0;
		this.error = false;
	}

	hasError() {
		return this.error;
	}

	isEOF() {
		return this.offset === this.size || this.hasError();
	}

	currentByte() {
		return this.isEOF() ? 255 : this.buffer[this.offset];
	}

	advance() {
		if (!this.isEOF()) {
			this.offset++;
		} else {
			this.error = true;
		}
	}
}

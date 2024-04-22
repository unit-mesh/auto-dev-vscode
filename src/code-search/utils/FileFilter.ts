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
				return this.checkBinary(buffer, read.bytesRead);
			} catch (error) {
				await closeAsync(fileDescriptor);
				throw error;
			}
		} else {
			return this.checkBinary(input, length === undefined ? input.length : length);
		}
	}


	isString(value: any) {
		return typeof value === 'string' || value instanceof String;
	}

	BUFFER_SIZE: number = 512; // 缓冲区大小

	// 二进制文件的阈值，表示二进制字符的比例超过这个值则判定为二进制文件
	checkBinary(data: Buffer, length: number): boolean {
		// 如果文件为空，则不是二进制文件
		if (length === 0) {
			return false;
		}

		let binaryCount = 0; // 记录二进制字符的数量
		const maxLength = Math.min(length, this.BUFFER_SIZE); // 只检查缓冲区内的数据

		// 检查 BOM（Byte Order Mark）和 UTF-16 编码
		if (
			(maxLength >= 3 && data[0] === 0xEF && data[1] === 0xBB && data[2] === 0xBF) ||
			(maxLength >= 4 && data[0] === 0x00 && data[1] === 0x00 && data[2] === 0xFE && data[3] === 0xFF) ||
			(maxLength >= 4 && data[0] === 0xFF && data[1] === 0xFE && data[2] === 0x00 && data[3] === 0x00) ||
			(maxLength >= 4 && data[0] === 0x84 && data[1] === 0x31 && data[2] === 0x95 && data[3] === 0x33)
		) {
			return false;
		}

		// 检查 PDF 文件的标识符
		if (maxLength >= 5 && data.slice(0, 5).toString() === '%PDF-') {
			return true;
		}

		// 检查 UTF-16 编码
		if ((maxLength >= 2 && data[0] === 0xFE && data[1] === 0xFF) || (maxLength >= 2 && data[0] === 0xFF && data[1] === 0xFE)) {
			return false;
		}

		// 检查每个字节，判断是否为二进制字符
		for (let i = 0; i < maxLength; i++) {
			if (data[i] === 0x00) {
				return true; // 发现空字符，可能是二进制文件
			}
			// 判断是否为 ASCII 控制字符或扩展 ASCII 控制字符
			if (
				(data[i] < 0x07 || data[i] > 0x0E) && (data[i] < 0x20 || data[i] > 0x7F) &&
				!(data[i] > 0xC1 && data[i] < 0xE0 && i + 1 < maxLength) &&
				!(data[i] > 0xDF && data[i] < 0xF0 && i + 2 < maxLength && data[i + 1] > 0x7F && data[i + 1] < 0xC0 && data[i + 2] > 0x7F && data[i + 2] < 0xC0)
			) {
				binaryCount++; // 记录二进制字符的数量
				if (i >= 32 && binaryCount * 100 / maxLength > 10) {
					return true; // 如果二进制字符比例超过阈值，则判定为二进制文件
				}
			}
		}

		// 如果二进制字符比例超过阈值或者二进制字符数量超过 1 且满足特定条件，则判定为二进制文件
		return binaryCount * 100 / maxLength > 10 || (binaryCount > 1 && containsNonAsciiSequence(data, maxLength));
	}
}

// 检查是否包含连续的非 ASCII 字符序列
function containsNonAsciiSequence(data: Buffer, length: number): boolean {
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

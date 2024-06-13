import os from 'node:os';

import fs from 'fs';
import path from 'path';

export function getAutoDevGlobalPath(): string {
	// This is ~/.autodev on mac/linux
	const autodevPath = path.join(os.homedir(), '.autodev');
	if (!fs.existsSync(autodevPath)) {
		fs.mkdirSync(autodevPath);
	}

	return autodevPath;
}

export function getDocsSqlitePath(): string {
	return path.join(getIndexFolderPath(), 'docs.sqlite');
}

export function getIndexFolderPath(): string {
	const indexPath = path.join(getAutoDevGlobalPath(), 'index');
	if (!fs.existsSync(indexPath)) {
		fs.mkdirSync(indexPath);
	}
	return indexPath;
}

export function getLanceDbPath(): string {
	return path.join(getIndexFolderPath(), 'lancedb');
}

export function getBasename(filepath: string, n: number = 1): string {
	return filepath.split(/[\\/]/).pop() ?? '';
}

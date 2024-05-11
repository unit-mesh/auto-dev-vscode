import path from "path";
import fs from "fs";
import os from "node:os";

export function getAutoDevGlobalPath(): string {
	// This is ~/.autodev on mac/linux
	const autodevPath = path.join(os.homedir(), ".autodev");
	if (!fs.existsSync(autodevPath)) {
		fs.mkdirSync(autodevPath);
	}

	return autodevPath;
}

export function getIndexFolderPath(): string {
	const indexPath = path.join(getAutoDevGlobalPath(), "index");
	if (!fs.existsSync(indexPath)) {
		fs.mkdirSync(indexPath);
	}
	return indexPath;
}

export function getLanceDbPath(): string {
	return path.join(getIndexFolderPath(), "lancedb");
}

export function getBasename(filepath: string, n: number = 1): string {
	return filepath.split(/[\\/]/).pop() ?? "";
}
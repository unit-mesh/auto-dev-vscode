import ignore from 'ignore';
import * as path from 'path';
import * as vscode from 'vscode';

import { splitGlob } from 'base/node/glob';
import { defaultIgnoreDir, defaultIgnoreFile } from 'base/node/ignore';

import { uriFromFilePath } from '../vscode';

function isIgnoreFilepath(filepath: string): boolean {
	return filepath.endsWith('.gitignore') || filepath.endsWith('.continueignore') || filepath.endsWith('.autodevignore');
}

export async function* traverseDirectory(
	directory: string,
	gitIgnorePatterns: string[],
	returnFiles: boolean = true,
	onlyThisDirectory: string[] | undefined,
): AsyncGenerator<string> {
	const nodes = await vscode.workspace.fs.readDirectory(uriFromFilePath(directory));
	const files: string[] = [];
	const dirs: string[] = [];
	const ignorePatterns: string[] = [];
	for (const [name, type] of nodes) {
		switch (type) {
			case vscode.FileType.Directory:
				if (!defaultIgnoreDir.ignores(name)) {
					dirs.push(name);
				}
				break;
			case vscode.FileType.File:
				if (!defaultIgnoreFile.ignores(name)) {
					if (isIgnoreFilepath(name)) {
						// Make sure you are respecting windows with linux dev container
						const bytes = await vscode.workspace.fs.readFile(uriFromFilePath(path.join(directory, name)));
						const contents = new TextDecoder().decode(bytes);
						ignorePatterns.push(...contents.split('\n').filter(p => p.trim() !== '' && p[0] !== '#'));
					} else {
						files.push(name);
					}
				}
				break;
			case vscode.FileType.SymbolicLink:
				break;
			case vscode.FileType.Unknown:
				break;
		}
	}

	const allIgnorePatterns = [...gitIgnorePatterns, ...ignorePatterns].map(pattern => {
		if (!pattern.slice(0, -1).includes('/')) {
			return '**/' + pattern;
		}
		return pattern;
	});
	const ig = ignore().add(allIgnorePatterns);

	if (!onlyThisDirectory) {
		for (const node of returnFiles ? files : dirs) {
			if (!ig.ignores(node)) {
				yield path.join(directory, node);
			}
		}
	}

	const subDirIgnorePatterns: { [key: string]: string[] } = {};
	const wildcardPatterns: string[] = [];
	for (const ignorePattern of allIgnorePatterns) {
		const [first, rest, leadingWildcard] = splitGlob(ignorePattern);
		if (leadingWildcard) {
			wildcardPatterns.push('**/' + first + (rest ? '/' + rest : ''));
		}
		if (first) {
			if (subDirIgnorePatterns[first] === undefined) {
				subDirIgnorePatterns[first] = [];
			}
			subDirIgnorePatterns[first].push(rest);
		}
	}
	const entries = Object.entries(subDirIgnorePatterns);
	for (const dir of dirs) {
		// Skip everything except onlyThisDirectory
		if (onlyThisDirectory && onlyThisDirectory[0] !== dir) {
			continue;
		}

		// Recurse if not ignored
		if (!(ig.ignores(dir + '/') || ig.ignores(dir))) {
			// For patterns who can potentially match items of this subdir, strip the subdir from the start
			const keepPatterns = [...wildcardPatterns];
			for (const [startPattern, subDirPatterns] of entries) {
				if (ignore().add(startPattern).ignores(dir)) {
					keepPatterns.push(...subDirPatterns);
				}
			}
			for await (const file of traverseDirectory(
				path.join(directory, dir),
				keepPatterns,
				returnFiles,
				onlyThisDirectory && onlyThisDirectory.length > 1 ? onlyThisDirectory.slice(1) : undefined,
			)) {
				yield file;
			}
		}
	}
}

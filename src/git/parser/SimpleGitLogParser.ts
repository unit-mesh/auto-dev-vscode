export interface ParsedFileChange {
	status: string;
	///
	content: string;
	filename: string;
}

export function parseGitLog(log: string): ParsedFileChange[] {
	const changes: ParsedFileChange[] = [];
	const lines = log.split('\n');
	let currentFile: Partial<ParsedFileChange> | null = null;

	for (const line of lines) {
		if (line.startsWith('diff --git')) {
			if (currentFile && currentFile.filename) {
				changes.push(currentFile as ParsedFileChange);
			}
			currentFile = { filename: '', status: '', content: '' };
			const parts = line.split(' ');
			currentFile.filename = parts[2].substring(2); // remove the 'a/' prefix
		} else if (line.startsWith('index')) {
			// Do nothing with index line for now
		} else if (line.startsWith('---')) {
			currentFile!.status = line.includes('/dev/null') ? 'deleted' : 'modified';
		} else if (line.startsWith('+++')) {
			currentFile!.status = line.includes('/dev/null') ? 'deleted' : 'added';
		} else if (line.startsWith('@@')) {
			currentFile!.content += line + '\n';
		} else if (line.startsWith('+') || line.startsWith('-') || line.startsWith(' ')) {
			currentFile!.content += line + '\n';
		}
	}

	if (currentFile && currentFile.filename) {
		changes.push(currentFile as ParsedFileChange);
	}

	return changes;
}

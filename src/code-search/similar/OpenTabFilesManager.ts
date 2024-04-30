import vscode, { TextDocument, Uri } from "vscode";
import path from "path";

export class OpenTabFilesManager {
	maxRelevantFiles: number = 20;
	snippetLength: number = 60;

	constructor(maxRelevantFiles: number = 20, snippetLength: number = 60) {
		this.maxRelevantFiles = maxRelevantFiles;
		this.snippetLength = snippetLength;
	}

	getMostRecentFiles(languageId: string) {
		const filteredFiles = vscode.workspace.textDocuments.filter(file => {
			return file.languageId === languageId;
		});

		// Get the most recent files. This is just an example.
		const start = Math.max(filteredFiles.length - this.maxRelevantFiles, 0);
		const end = filteredFiles.length;
		return filteredFiles.slice(start, end);
	}

	relativePathTo(relativeFileUri: Uri) {
		let workspaceFolder = vscode.workspace.getWorkspaceFolder(relativeFileUri);
		if (!workspaceFolder) {
			return null;
		}

		return path.relative(workspaceFolder.uri.fsPath, relativeFileUri.fsPath);
	}

	private similarChunksWithPaths(element: TextDocument, uri: Uri) {
		let mostRecentFiles = this.getMostRecentFiles(element.languageId);
		let mostRecentFilesRelativePaths = mostRecentFiles.map(it => this.relativePathTo(uri));
		let chunks = this.extractChunks(element, mostRecentFiles);

		// Return the chunks and the paths of the files they came from
	}

	private extractChunks(element: TextDocument, mostRecentFiles: TextDocument[]) {
		return mostRecentFiles.map(file => {
			return file.getText().split("\n", this.snippetLength).map(line => {
				return line.trim();
			});
		});
	}
}


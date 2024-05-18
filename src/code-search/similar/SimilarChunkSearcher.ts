import vscode, { TextDocument, Uri } from "vscode";
import path from "path";
import { SimilarSearchElement } from "./SimilarSearchElementBuilder";
import { JaccardSimilarity } from "./algorithm/JaccardSimilarity";
import { SimilarSearcher } from "./algorithm/SimilarSearcher";
import { SimilarChunk } from "./SimilarChunk";

export class SimilarChunkSearcher extends JaccardSimilarity implements SimilarSearcher<TextDocument> {
	private static instance_: SimilarChunkSearcher;

	private constructor() {
		super();
	}

	public static instance(): SimilarChunkSearcher {
		if (!SimilarChunkSearcher.instance_) {
			SimilarChunkSearcher.instance_ = new SimilarChunkSearcher();
		}

		return SimilarChunkSearcher.instance_;
	}

	maxRelevantFiles: number = 20;
	snippetLength: number = 60;

	query(element: SimilarSearchElement): SimilarChunk[] {
		let similarChunks = this.similarChunksWithPaths(element);
		similarChunks = similarChunks.filter(it => it.path !== element.path);
		return similarChunks;
	}

	private similarChunksWithPaths(element: SimilarSearchElement): SimilarChunk [] {
		let mostRecentFiles = this.getMostRecentFiles(element.languageId);
		// todo: update for calculate the relative path
		let mostRecentFilesRelativePaths = mostRecentFiles.map(it => this.relativePathTo(it.uri));

		let chunks = this.extractChunks(mostRecentFiles);
		let jaccardSimilarities = this.tokenLevelJaccardSimilarity(element.beforeCursor, chunks);

		let similarChunks: SimilarChunk[] = [];
		jaccardSimilarities.forEach((jaccardList, fileIndex) => {
			let maxIndex = jaccardList.indexOf(Math.max(...jaccardList));
			let targetChunk = chunks[fileIndex][maxIndex];

			if (targetChunk) {
				similarChunks.push({
					path: mostRecentFilesRelativePaths[fileIndex]!!,
					text: targetChunk
				});
			}
		});

		return similarChunks;
	}

	public extractChunks(mostRecentFiles: TextDocument[]) {
		return mostRecentFiles.map(file => {
			let lines = file.getText().split("\n");

			let chunks: string[] = [];
			for (let i = 0; i < lines.length; i += this.snippetLength) {
				chunks.push(lines.slice(i, i + this.snippetLength).join("\n"));
			}

			return chunks;
		});
	}

	public getMostRecentFiles(languageId: string) {
		const filteredFiles = vscode.workspace.textDocuments.filter(file => {
			return file.languageId === languageId;
		});

		// Get the most recent files. This is just an example.
		const start = Math.max(filteredFiles.length - this.maxRelevantFiles, 0);
		const end = filteredFiles.length;
		return filteredFiles.slice(start, end);
	}

	private relativePathTo(relativeFileUri: Uri) {
		let workspaceFolder = vscode.workspace.getWorkspaceFolder(relativeFileUri);

		if (!workspaceFolder) {
			return relativeFileUri.fsPath;
		}

		return path.relative(workspaceFolder.uri.fsPath, relativeFileUri.fsPath);
	}
}


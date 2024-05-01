import vscode, { TextDocument, Uri } from "vscode";
import path from "path";
import { SimilarChunkTokenizer } from "./SimilarChunkTokenizer";
import { SimilarSearchElement } from "./SimilarSearchElementBuilder";

export class SimilarChunkSearcher {
	private static instance_: SimilarChunkSearcher;

	private constructor() {
	}

	public static instance(): SimilarChunkSearcher {
		if (!SimilarChunkSearcher.instance_) {
			SimilarChunkSearcher.instance_ = new SimilarChunkSearcher();
		}

		return SimilarChunkSearcher.instance_;
	}

	maxRelevantFiles: number = 20;
	snippetLength: number = 60;

	query(element: SimilarSearchElement): string[] {
		let similarChunks = this.similarChunksWithPaths(element);
		// todo: handle for length
		return similarChunks;
	}

	private similarChunksWithPaths(element: SimilarSearchElement): string [] {
		let mostRecentFiles = this.getMostRecentFiles(element.languageId);
		// todo: update for calculate the relative path
		let mostRecentFilesRelativePaths = mostRecentFiles.map(it => this.relativePathTo(it.uri));

		let chunks = this.extractChunks(mostRecentFiles);

		let jaccardSimilarities = this.tokenLevelJaccardSimilarity(chunks, element);

		// let paths: string[] = [];
		let chunksList: string[] = [];

		jaccardSimilarities.forEach((jaccardList, fileIndex) => {
			let maxIndex = jaccardList.indexOf(Math.max(...jaccardList));
			// paths.push(mostRecentFilesRelativePaths[fileIndex]!!);
			chunksList.push(chunks[fileIndex][maxIndex]);
		});

		return chunksList;
	}

	private extractChunks(mostRecentFiles: TextDocument[]) {
		return mostRecentFiles.map(file => {
			return file.getText().split("\n", this.snippetLength);
		});
	}

	private getMostRecentFiles(languageId: string) {
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

	private tokenLevelJaccardSimilarity(chunks: string[][], element: SimilarSearchElement): number[][] {
		const currentFileTokens: Set<string> = new Set(this.tokenize(element.beforeCursor));
		return chunks.map(list => {
			return list.map(it => {
				console.log(it);
				const tokenizedFile: Set<string> = new Set(this.tokenize(it));
				return this.similarityScore(currentFileTokens, tokenizedFile);
			});
		});
	}

	tokenize(input: string): Set<string> {
		return SimilarChunkTokenizer.instance().tokenize(input);
	}

	private similarityScore(set1: Set<string>, set2: Set<string>): number {
		const intersectionSize: number = [...set1].filter(x => set2.has(x)).length;
		const unionSize: number = new Set([...set1, ...set2]).size;
		return intersectionSize / unionSize;
	}
}


import vscode, { TextDocument, Uri } from "vscode";
import path from "path";
import { SearchElement } from "./SearchElement";

export class SimilarChunk {
	// singleton
	private static instance_: SimilarChunk;

	private constructor() {
	}

	public static instance(): SimilarChunk {
		if (!SimilarChunk.instance_) {
			SimilarChunk.instance_ = new SimilarChunk();
		}

		return SimilarChunk.instance_;
	}

	maxRelevantFiles: number = 20;
	snippetLength: number = 60;

	query(element: SearchElement): string[] {
		let similarChunks = this.similarChunksWithPaths(element);
		// todo: handle for length
		return similarChunks;
	}

	private similarChunksWithPaths(element: SearchElement): string [] {
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

	private tokenLevelJaccardSimilarity(chunks: string[][], element: SearchElement): number[][] {
		const currentFileTokens: Set<string> = new Set(this.tokenize(element.beforeCursor));
		return chunks.map(list => {
			return list.map(it => {
				console.log(it);
				const tokenizedFile: Set<string> = new Set(this.tokenize(it));
				return this.similarityScore(currentFileTokens, tokenizedFile);
			});
		});
	}

	stopWords = ["we", "our", "you", "it", "its", "they", "them", "their", "this", "that", "these", "those", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "having", "do", "does", "did", "doing", "can", "don", "t", "s", "will", "would", "should", "what", "which", "who", "when", "where", "why", "how", "a", "an", "the", "and", "or", "not", "no", "but", "because", "as", "until", "again", "further", "then", "once", "here", "there", "all", "any", "both", "each", "few", "more", "most", "other", "some", "such", "above", "below", "to", "during", "before", "after", "of", "at", "by", "about", "between", "into", "through", "from", "up", "down", "in", "out", "on", "off", "over", "under", "only", "own", "same", "so", "than", "too", "very", "just", "now"];
	programmingKeywords = ["if", "then", "else", "for", "while", "with", "def", "function", "return", "TODO", "import", "try", "catch", "raise", "finally", "repeat", "switch", "case", "match", "assert", "continue", "break", "const", "class", "enum", "struct", "static", "new", "super", "this", "var"];

	stopWordsSet = new Set([...this.stopWords, ...this.programmingKeywords]);

	/**
	 * since is slowly will tokenize, we revoke the same way will Copilot:
	 * https://github.com/mengjian-github/copilot-analysis#promptelement%E4%B8%BB%E8%A6%81%E5%86%85%E5%AE%B9
	 */
	tokenize(input: string) {
		return new Set(this.splitIntoWords(input).filter(word => !this.stopWordsSet.has(word)));
	}

	splitIntoWords(input: string) {
		return input.split(/[^a-zA-Z0-9]/).filter(word => word.length > 0);
	}

	private similarityScore(set1: Set<string>, set2: Set<string>): number {
		const intersectionSize: number = [...set1].filter(x => set2.has(x)).length;
		const unionSize: number = new Set([...set1, ...set2]).size;
		return intersectionSize / unionSize;
	}
}


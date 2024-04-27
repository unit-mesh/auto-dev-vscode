import { countTokens } from "../token/TokenCounter";

export interface ChunkWithoutID {
	content: string;
	startLine: number;
	endLine: number;
	otherMetadata?: { [key: string]: any };
}

export interface Chunk extends ChunkWithoutID {
	digest: string;
	filepath: string;
	index: number; // Index of the chunk in the document at filepath
}

export function* basicChunker(
	contents: string,
	maxChunkSize: number,
): Generator<ChunkWithoutID> {
	let chunkContent = "";
	let chunkTokens = 0;
	let startLine = 0;
	let currLine = 0;

	for (const line of contents.split("\n")) {
		const lineTokens = countTokens(line);
		if (chunkTokens + lineTokens > maxChunkSize - 5) {
			yield { content: chunkContent, startLine, endLine: currLine - 1 };
			chunkContent = "";
			chunkTokens = 0;
			startLine = currLine;
		}

		if (lineTokens < maxChunkSize) {
			chunkContent += line + "\n";
			chunkTokens += lineTokens + 1;
		}

		currLine++;
	}

	yield {
		content: chunkContent,
		startLine,
		endLine: currLine - 1,
	};
}

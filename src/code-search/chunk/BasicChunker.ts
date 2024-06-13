import { countTokens } from '../token/TokenCounter';
import { ChunkWithoutID } from './_base/Chunk';

export function* basicChunker(contents: string, maxChunkSize: number, language: string): Generator<ChunkWithoutID> {
	let chunkContent = '';
	let chunkTokens = 0;
	let startLine = 0;
	let currLine = 0;

	for (const line of contents.split('\n')) {
		const lineTokens = countTokens(line);
		if (chunkTokens + lineTokens > maxChunkSize - 5) {
			yield { language, content: chunkContent, startLine, endLine: currLine - 1 };
			chunkContent = '';
			chunkTokens = 0;
			startLine = currLine;
		}

		if (lineTokens < maxChunkSize) {
			chunkContent += line + '\n';
			chunkTokens += lineTokens + 1;
		}

		currLine++;
	}

	yield {
		language,
		content: chunkContent,
		startLine,
		endLine: currLine - 1,
	};
}

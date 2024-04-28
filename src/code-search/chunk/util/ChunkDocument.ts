import { countTokens } from "../../token/TokenCounter";
import { MAX_CHUNK_SIZE } from "../../constants";
import { EXT_LANGUAGE_MAP } from "../../../editor/language/ExtensionLanguageMap";
import { codeChunker } from "./CodeChunkerWrapper";
import { Chunk, ChunkWithoutID } from "../Chunk";

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

async function* chunkDocumentWithoutId(
	filepath: string,
	contents: string,
	maxChunkSize: number,
): AsyncGenerator<ChunkWithoutID> {
	if (contents.trim() === "") {
		return;
	}

	const segs = filepath.split(".");
	const ext = segs[segs.length - 1];
	if (ext in EXT_LANGUAGE_MAP) {
		try {
			for await (const chunk of codeChunker(filepath, contents, maxChunkSize)) {
				yield chunk;
			}
			return;
		} catch (e) {
			// console.error(`Failed to parse ${filepath}: `, e);
			// falls back to basicChunker
		}
	}

	yield* basicChunker(contents, maxChunkSize);
}

export async function* chunkDocument(
	filepath: string,
	contents: string,
	maxChunkSize: number,
	digest: string,
): AsyncGenerator<Chunk> {
	let index = 0;
	for await (let chunkWithoutId of chunkDocumentWithoutId(
		filepath,
		contents,
		maxChunkSize,
	)) {
		if (countTokens(chunkWithoutId.content) > MAX_CHUNK_SIZE) {
			console.warn(
				`Chunk with more than ${maxChunkSize} tokens constructed: `,
				filepath,
				countTokens(chunkWithoutId.content),
			);
			continue;
		}
		yield {
			...chunkWithoutId,
			digest,
			index,
			filepath,
		};
		index++;
	}
}
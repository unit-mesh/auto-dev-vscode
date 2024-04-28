import { countTokens } from "../../token/TokenCounter";
import { MAX_CHUNK_SIZE } from "../../constants";
import { EXT_LANGUAGE_MAP } from "../../../editor/language/ExtensionLanguageMap";
import { Chunk, ChunkWithoutID } from "../_base/Chunk";
import { ConstructCodeChunker } from "../ConstructCodeChunker";
import { basicChunker } from "../BasicChunker";

async function* chunkDocumentWithoutId(
	filepath: string,
	contents: string,
	maxChunkSize: number,
): AsyncGenerator<ChunkWithoutID> {
	if (contents.trim() === "") {
		return;
	}

	const chunker = new ConstructCodeChunker();
	const segs = filepath.split(".");
	const ext = segs[segs.length - 1];
	if (ext in EXT_LANGUAGE_MAP) {
		try {
			for await (const chunk of chunker.chunk(filepath, contents, maxChunkSize)) {
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
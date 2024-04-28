import { Chunker, ChunkWithoutID } from "./Chunk";
import { getParserForFile } from "../../editor/language/parser/ParserUtil";
import { parsedCodeChunker } from "./util/CodeChunkerUtil";

export class ConstructCodeChunker implements Chunker {
	chunk(filepath: string, contents: string, maxChunkSize: number): AsyncGenerator<ChunkWithoutID> {
		return codeChunker(filepath, contents, maxChunkSize);
	}
}

export async function* codeChunker(
	filepath: string,
	contents: string,
	maxChunkSize: number,
): AsyncGenerator<ChunkWithoutID> {
	if (contents.trim().length === 0) {
		return;
	}

	let parser = await getParserForFile(filepath);
	if (parser === undefined) {
		console.warn(`Failed to load parser for file ${filepath}: `);
		return;
	}

	yield* parsedCodeChunker(parser, contents, maxChunkSize);
}
import { Chunker, ChunkWithoutID } from "./_base/Chunk";
import { getParserForFile } from "../../editor/language/parser/ParserUtil";
import { CollapsedCodeChunker } from "./_base/CollapsedCodeChunker";
import { languageFromPath } from "../../editor/language/ExtensionLanguageMap";

export class ConstructCodeChunker extends CollapsedCodeChunker implements Chunker {
	chunk(filepath: string, contents: string, maxChunkSize: number): AsyncGenerator<ChunkWithoutID> {
		return this.codeChunker(filepath, contents, maxChunkSize);
	}

	async* codeChunker(
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

		let language = languageFromPath(filepath);

		yield* this.parsedCodeChunker(parser, contents, maxChunkSize, language);
	}
}

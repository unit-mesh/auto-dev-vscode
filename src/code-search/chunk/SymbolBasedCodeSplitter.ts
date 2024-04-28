import { CollapsedCodeChunker } from "./_base/CollapsedCodeChunker";
import { ChunkWithoutID, Chunker } from "./_base/Chunk";
import { getParserForFile } from "../../editor/language/parser/ParserUtil";

/**
 * SymbolChunker will build with symbol information, the symbol information will be used to build the [ScopeGraph]
 *
 * For example, in javascript, the symbol information will be the:
 * - package name
 * - class name
 * - method name
 */
export class SymbolBasedCodeSplitter extends CollapsedCodeChunker implements Chunker {
	// todo: add parsed for cannocical name
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

		yield* this.parsedCodeChunker(parser, contents, maxChunkSize);
	}
}

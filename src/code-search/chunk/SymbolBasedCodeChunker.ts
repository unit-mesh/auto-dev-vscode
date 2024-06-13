import { Chunker, ChunkWithoutID } from './_base/Chunk';
import { ConstructCodeChunker } from './ConstructCodeChunker';

/**
 * SymbolChunker will build with symbol information, the symbol information will be used to build the [ScopeGraph]
 *
 * For example, in javascript, the symbol information will be the:
 * - package name
 * - class name
 * - method name
 */
export class SymbolBasedCodeChunker extends ConstructCodeChunker implements Chunker {
	// todo: add parsed for cannocical name
	chunk(filepath: string, contents: string, maxChunkSize: number): AsyncGenerator<ChunkWithoutID> {
		return this.codeChunker(filepath, contents, maxChunkSize);
	}
}

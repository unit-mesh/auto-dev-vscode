import { inferLanguage } from 'base/common/languages/languages';
import { ILanguageServiceProvider } from 'base/common/languages/languageService';

import { Chunker, ChunkWithoutID } from './_base/Chunk';
import { CollapsedCodeChunker } from './_base/CollapsedCodeChunker';

export class ConstructCodeChunker extends CollapsedCodeChunker implements Chunker {
	constructor(private lsp: ILanguageServiceProvider) {
		super();
	}

	chunk(filepath: string, contents: string, maxChunkSize: number): AsyncGenerator<ChunkWithoutID> {
		return this.codeChunker(filepath, contents, maxChunkSize);
	}

	async *codeChunker(filepath: string, contents: string, maxChunkSize: number): AsyncGenerator<ChunkWithoutID> {
		if (contents.trim().length === 0) {
			return;
		}

		const language = inferLanguage(filepath);

		const parser = await this.lsp.getParser(language);
		if (parser === undefined) {
			console.warn(`Failed to load parser for file ${filepath}: `);
			return;
		}

		yield* this.parsedCodeChunker(parser, contents, maxChunkSize, language);
	}
}

import { TextRange } from "../scope-graph/model/TextRange";
import { ChunkWithoutID, Chunker } from "./_base/Chunk";

/**
 * The `LinePartitionChunker` class is an implementation of the `Chunker` interface.
 * It is used to divide a given text content into chunks based on the maximum chunk size provided.
 *
 * @class
 * @implements {Chunker}
 *
 * @method chunk
 * This is an asynchronous generator method that yields chunks of the given content.
 * It takes a file path, the content of the file, and the maximum chunk size as parameters.
 * It divides the content into chunks by lines and yields each chunk as an object containing the chunk content,
 * the start line, and the end line.
 *
 * @method byLines
 * This method is used to divide the given source text into chunks of the specified size.
 * It returns an array of `TextRange` objects, each representing a chunk of the source text.
 * The method first identifies the end of each line in the source text, then divides the text into chunks of the specified size.
 * Each chunk is represented as a `TextRange` object, which includes the start and end positions of the chunk in the source text,
 * as well as the chunk content.
 *
 * @param {string} filepath - The path of the file to be chunked.
 * @param {string} contents - The content of the file to be chunked.
 * @param {number} maxChunkSize - The maximum size of each chunk.
 *
 * @returns {AsyncGenerator<ChunkWithoutID>} - An asynchronous generator that yields each chunk of the file content.
 *
 * @example
 * const chunker = new LinePartitionChunker();
 * for await (const chunk of chunker.chunk(filepath, contents, maxChunkSize)) {
 *   console.log(chunk);
 * }
 */
export class LinePartitionChunker implements Chunker {
	async* chunk(filepath: string, contents: string, maxChunkSize: number): AsyncGenerator<ChunkWithoutID> {
		const chunks = this.byLines(contents, maxChunkSize);
		for (const chunk of chunks) {
			yield {
				content: chunk.getText(),
				startLine: chunk.start.line,
				endLine: chunk.end.line,
			};
		}
	}

	byLines(source: string, size: number): TextRange[] {
		const ends = [0, ...Array.from(source.matchAll(/\n/g), match => match.index)]
			.map((index, lineNumber) => [lineNumber, index]);

		const last = source.length - 1;
		const lastLine = ends.length > 0 ? ends[ends.length - 1][0] : 0;
		const stepBySize = (array: number[][], step: number) => array.filter((_, index) => index % step === 0);

		let chunks = stepBySize(ends, size)
			.map(([startLine, startByte], index, array) => {
				const [endLine, endByte] = array[index + 1] || [lastLine, last];
				if (startByte >= endByte) {
					return undefined;
				}

				return new TextRange(
					{ byte: startByte, line: startLine, column: 0 },
					{ byte: endByte, line: endLine, column: 0 },
					source.substring(startByte, endByte)
				);
			})
			.filter(chunk => chunk instanceof TextRange);

		return chunks as TextRange[];
	}
}
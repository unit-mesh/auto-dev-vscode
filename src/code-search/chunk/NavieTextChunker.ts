import { TextRange } from "../semantic/model/TextRange";

/**
 * Pure text chunker that splits text by whitespace.
 */
export class NavieTextChunker {
	public static chunk(text: string): string[] {
		return text.split(/\s+/);
	}

	byLines(src: string, size: number): TextRange[] {
		const ends = [0, ...Array.from(src.matchAll(/\n/g), match => match.index)]
			.map((index, lineNumber) => [lineNumber, index]);

		const last = src.length - 1;
		const lastLine = ends.length > 0 ? ends[ends.length - 1][0] : 0;
		const stepBySize = (array: number[][], step: number) => array.filter((_, index) => index % step === 0);

		let chunks = stepBySize(ends, size)
			.map(([startLine, startByte], index, array) => {
				const [endLine, endByte] = array[index + 1] || [lastLine, last];
				if (startByte >= endByte) {
					return undefined;
				}

				return new TextRange(
					{
						byte: startByte,
						line: startLine,
						column: 0
					}, {
						byte: endByte,
						line: endLine,
						column: 0
					},
					src.substring(startByte, endByte)
				);
			})
			.filter(chunk => chunk instanceof TextRange);

		return chunks as TextRange[];
	}
}
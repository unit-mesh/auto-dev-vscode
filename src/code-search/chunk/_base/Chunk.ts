export interface ChunkWithoutID {
	content: string;
	startLine: number;
	endLine: number;
	language: string;
	otherMetadata?: { [key: string]: any };
}

export interface Chunk extends ChunkWithoutID {
	digest: string;
	filepath: string;
	index: number; // Index of the chunk in the document at filepath
}

export interface Chunker {
	chunk(filepath: string, contents: string, maxChunkSize: number): AsyncGenerator<ChunkWithoutID>;
}

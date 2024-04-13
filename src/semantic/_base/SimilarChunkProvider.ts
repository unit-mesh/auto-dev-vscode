export interface SimilarChunkProvider {
		calculate(chunk: string): string[];
}
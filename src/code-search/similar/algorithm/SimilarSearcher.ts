import { SimilarSearchElement } from "../SimilarSearchElementBuilder";
import { SimilarChunk } from "../SimilarChunk";

export interface SimilarSearcher<T> {
	search(element: SimilarSearchElement): SimilarChunk[];

	extractChunks(mostRecentFiles: T[]): string[][];

	getMostRecentFiles(languageId: string): T[];
}
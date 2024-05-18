import { SimilarSearchElement } from "../SimilarSearchElementBuilder";
import { SimilarChunk } from "../SimilarChunk";

export interface SimilarSearcher<T> {
	query(element: SimilarSearchElement): SimilarChunk[];

	extractChunks(mostRecentFiles: T[]): string[][];

	getMostRecentFiles(languageId: string): T[];
}
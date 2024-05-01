import { SimilarSearchElement } from "../SimilarSearchElementBuilder";

export interface SimilarSearcher<T> {
	query(element: SimilarSearchElement): string[];

	extractChunks(mostRecentFiles: T[]): string[][];

	getMostRecentFiles(languageId: string): T[];
}
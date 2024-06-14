import { SimilarChunk } from '../SimilarChunk';
import { SimilarSearchElement } from '../SimilarSearchElementBuilder';

export interface SimilarSearcher<T> {
	search(element: SimilarSearchElement): SimilarChunk[];

	extractChunks(mostRecentFiles: T[]): string[][];

	getMostRecentFiles(languageId: string): T[];
}

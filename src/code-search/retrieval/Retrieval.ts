import { IdeAction } from "../../editor/editor-api/IdeAction";
import { EmbeddingsProvider } from "../embedding/_base/EmbeddingsProvider";
import { Chunk } from "../chunk/_base/Chunk";
import { FullTextSearchCodebaseIndex } from "../search/FullTextSearch";
import { RETRIEVAL_PARAMS } from "../utils/constants";
import { RetrievalQueryTerm } from "./RetrievalQueryTerm";

export interface ContextSubmenuItem {
	id: string;
	title: string;
	description: string;
}

export interface ContextItem {
	content: string;
	name: string;
	description: string;
	editing?: boolean;
	editable?: boolean;
}

export interface RetrieveOption {
	filterDirectory: string | undefined;
	filterLanguage: string | undefined;
	withFullTextSearch: boolean;
	withSemanticSearch: boolean;
}

export abstract class Retrieval {
	/**
	 * Retrieves context items based on the provided full input.
	 *
	 * @param fullInput - The full input string used to retrieve context items.
	 * @param ide - The IDE action that triggered the retrieval of context items.
	 * @param embeddingsProvider - The provider of embeddings used for context item retrieval.
	 * @param options - Optional parameters for customizing the retrieval process.
	 * @returns A Promise that resolves to an array of ContextItem objects representing the retrieved context items.
	 */
	abstract retrieve(
		fullInput: string,
		ide: IdeAction,
		embeddingsProvider: EmbeddingsProvider,
		options: RetrieveOption | undefined,
	): Promise<ContextItem[]>;

	deduplicateArray<T>(
		array: T[],
		equal: (a: T, b: T) => boolean,
	): T[] {
		const result: T[] = [];

		for (const item of array) {
			if (!result.some((existingItem) => equal(existingItem, item))) {
				result.push(item);
			}
		}

		return result;
	}

	deduplicateChunks(chunks: Chunk[]): Chunk[] {
		return this.deduplicateArray(chunks, (a, b) => {
			return (
				a.filepath === b.filepath &&
				a.startLine === b.startLine &&
				a.endLine === b.endLine
			);
		});
	}

	async retrieveFts(term: RetrievalQueryTerm): Promise<Chunk[]> {
		const ftsIndex = new FullTextSearchCodebaseIndex();

		let ftsResults: Chunk[] = [];
		try {
			if (term.query.trim() !== "") {
				ftsResults = await ftsIndex.retrieve(
					term.tags,
					term.query.trim().split(" ").map((element) => `"${element}"`).join(" OR "),
					term.n,
					term.filterDirectory,
					undefined,
					RETRIEVAL_PARAMS.bm25Threshold,
					term.language,
				);
			}
			return ftsResults;
		} catch (e) {
			console.warn("Error retrieving from FTS:", e);
			return [];
		}
	}
}
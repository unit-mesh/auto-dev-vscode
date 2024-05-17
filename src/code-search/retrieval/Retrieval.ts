import { IdeAction } from "../../editor/editor-api/IdeAction";
import { EmbeddingsProvider } from "../embedding/_base/EmbeddingsProvider";
import { Chunk } from "../chunk/_base/Chunk";
import { BranchAndDir } from "../indexing/_base/CodebaseIndex";
import { FullTextSearchCodebaseIndex } from "../search/FullTextSearch";
import { RETRIEVAL_PARAMS } from "../utils/constants";

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

export class RetrievalQueryTerm {
	query = "";
	n = 0;
	tags: BranchAndDir[];
	filterDirectory?: string;
	language?: string;

	constructor(query: string, n: number, tags: BranchAndDir[], filterDirectory?: string, language?: string) {
		this.query = query;
		this.n = n;
		this.tags = tags;
		this.filterDirectory = filterDirectory;
		this.language = language;
	}
}

export abstract class Retrieval {

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

	abstract retrieve(
		fullInput: string,
		ide: IdeAction,
		embeddingsProvider: EmbeddingsProvider,
		filterDirectory: string | undefined,
		language: string | undefined,
	): Promise<ContextItem[]>;
}
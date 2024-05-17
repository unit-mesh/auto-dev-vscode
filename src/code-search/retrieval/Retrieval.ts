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

	async retrieveFts(
		query: string,
		n: number,
		tags: BranchAndDir[],
		filterDirectory: string | undefined,
		language: string | undefined = undefined,
	): Promise<Chunk[]> {
		const ftsIndex = new FullTextSearchCodebaseIndex();

		let ftsResults: Chunk[] = [];
		try {
			if (query.trim() !== "") {
				ftsResults = await ftsIndex.retrieve(
					tags,
					query.trim().split(" ").map((element) => `"${element}"`).join(" OR "),
					n,
					filterDirectory,
					undefined,
					RETRIEVAL_PARAMS.bm25Threshold,
					language,
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
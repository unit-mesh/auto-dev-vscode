import { IdeAction } from "../../editor/editor-api/IdeAction";
import { EmbeddingsProvider } from "../embedding/_base/EmbeddingsProvider";
import { Chunk } from "../chunk/_base/Chunk";
import { FullTextSearchCodebaseIndex } from "../search/FullTextSearch";
import { RETRIEVAL_PARAMS } from "../utils/constants";
import { RetrievalQueryTerm } from "./RetrievalQueryTerm";
import { TextRange } from "../scope-graph/model/TextRange";
import { GitAction } from "../../editor/editor-api/scm/GitAction";
import { Commit } from "../../types/git";
import { TfIdfSemanticChunkSearch } from "../search/TfIdfSemanticChunkSearch";

export interface ContextSubmenuItem {
	id: string;
	title: string;
	description: string;
}

export interface ContextItem {
	content: string;
	name: string;
	path: string;
	range: TextRange;
	description: string;
	editing?: boolean;
	editable?: boolean;
}

export interface RetrieveOption {
	filterDirectory: string | undefined;
	filterLanguage: string | undefined;
	withFullTextSearch: boolean;
	withSemanticSearch: boolean;
	withGitChange: boolean | undefined;
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

	/**
	 * TODO: according commit messages to get by chunks
	 * CommitHistoryIndexer is responsible for indexing commit history of a codebase.
	 * Then, you can use {@link TfIdfSemanticChunkSearch} to search relative to commit history
	 *
	 * Based on Chunk indexing, we can get the commit change of code base, then it can be the user commits.
	 */
	async retrieveGit(git: GitAction, term: RetrievalQueryTerm): Promise<Chunk[]> {
		let tfIdfTextSearch = new TfIdfSemanticChunkSearch();
		let commits: Commit[] = await git.getAllHistoryCommits();

		// tfidf search by commit message get index
		let commitMessages = commits.map((commit) => commit.message);
		tfIdfTextSearch.addDocuments(commitMessages);

		// search by commit message
		let results = tfIdfTextSearch.search(term.query);
		// get the commit index
		let commitIndex = results.map((result) => commitMessages.indexOf(result));

		// get the commit change
		let chunks: Chunk[] = [];
		for (let index of commitIndex) {
			let commit = commits[index];
			let changes = await git.getChangeByHash(commit.hash);

			let chunk: Chunk = {
				language: "",
				digest: commit.hash,
				filepath: commit.hash,
				content: changes,
				startLine: 0,
				endLine: 0,
				index: 0
			};

			chunks.push(chunk);
		}

		return chunks;
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
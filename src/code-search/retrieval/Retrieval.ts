import { IdeAction } from "../../editor/editor-api/IdeAction";
import { EmbeddingsProvider } from "../embedding/_base/EmbeddingsProvider";
import { Chunk } from "../chunk/_base/Chunk";
import { FullTextSearchCodebaseIndex } from "../search/FullTextSearch";
import { RETRIEVAL_PARAMS } from "../utils/constants";
import { RetrievalQueryTerm } from "./RetrievalQueryTerm";
import { GitAction } from "../../editor/editor-api/scm/GitAction";
import { Commit } from "../../types/git";
import { TfIdfChunkSearch } from "../search/TfIdfChunkSearch";
import { languageFromPath } from "../../editor/language/ExtensionLanguageMap";
import { JaccardSimilarity } from "../similar/algorithm/JaccardSimilarity";
import { ContextItem } from "../../context-provider/_base/BaseContextProvider";

export interface RetrieveOption {
	/**
	 * filter the codebase by directory
	 */
	filterDirectory: string | undefined;
	/**
	 * filter the codebase by language
	 */
	filterLanguage: string | undefined;
	/**
	 * search the codebase by full text search, with {@link FullTextSearchCodebaseIndex}
	 */
	withFullTextSearch: boolean;
	/**
	 * search the codebase by semantic search, with {@link LanceDbIndex}
	 */
	withSemanticSearch: boolean;
	/**
	 * provider commit message for keywords, which is used for {@link TfIdfChunkSearch} and {@link HydeKeywordsStrategy}
 	 */
	withCommitMessageSearch: boolean | undefined;
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

	private similarity = new JaccardSimilarity();

	/**
	 * TODO: according commit messages to get by chunks
	 * CommitHistoryIndexer is responsible for indexing commit history of a codebase.
	 * Then, you can use {@link TfIdfChunkSearch} to search relative to commit history
	 *
	 * Based on Chunk indexing, we can get the commit change of code base, then it can be the user commits.
	 */
	async retrieveGit(git: GitAction, term: RetrievalQueryTerm, threshold: number = 0.6): Promise<Chunk[]> {
		let tfIdfTextSearch = new TfIdfChunkSearch();
		let commits: Commit[] = await git.getHistoryCommits();

		// tfidf search by commit message get index
		let commitMessages = commits.map((commit) => commit.message);
		tfIdfTextSearch.addDocuments(commitMessages);

		let querySet = new Set(term.query.split(" "));

		// search by commit message
		let results: number[] = tfIdfTextSearch.search(term.query);
		let indexes = results
			.map((score, index) => score > threshold ? index : -1)
			.filter((index) => index !== -1)
			.sort((a, b) => results[b] - results[a]);

		if (indexes.length === 0) {
			return [];
		}

		// take by term.n
		indexes = indexes.slice(0, term.n);

		// get the commit change
		let chunks: Chunk[] = [];
		for (let index of indexes) {
			if (index === -1) {
				continue;
			}

			let commit = commits[index];
			let changes = await git.getChangeByHash(commit.hash);

			if (changes.length === 0) {
				continue;
			}

			const changeChunks: Chunk[] = changes.map((change, index) => {
				let language = languageFromPath(change.filename);

				let similarityScore = this.similarity.pathSimilarity(change.filename, querySet);

				// similarityScore > 0.5
				if (similarityScore < 0.5) {
					return undefined;
				}

				return {
					language: language,
					digest: commit.hash,
					filepath: commit.hash,
					content: change.content,
					startLine: 0,
					endLine: 0,
					index: index
				};
			}).filter((chunk) => chunk !== undefined) as Chunk[];

			chunks.push(...changeChunks);
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
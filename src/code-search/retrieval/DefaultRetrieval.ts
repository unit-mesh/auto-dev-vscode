import { Chunk } from "../chunk/_base/Chunk";
import { IdeAction } from "../../editor/editor-api/IdeAction";
import { BranchAndDir } from "../indexing/_base/CodebaseIndex";
import { LanceDbIndex } from "../indexing/LanceDbIndex";
import { EmbeddingsProvider } from "../embedding/_base/EmbeddingsProvider";
import { getBasename } from "../utils/IndexPathHelper";
import { RETRIEVAL_PARAMS } from "../utils/constants";
import { FullTextSearchCodebaseIndex } from "../search/FullTextSearch";
import { channel } from "../../channel";

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

export class Retrieval {
	// singleton
	private static instance: Retrieval;

	private constructor() {}

	static getInstance() {
		if (!Retrieval.instance) {
			Retrieval.instance = new Retrieval();
		}
		return Retrieval.instance;
	}

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

	/// todo: add indextypes
	async retrieve(
		fullInput: string,
		ide: IdeAction,
		embeddingsProvider: EmbeddingsProvider,
		filterDirectory: string | undefined,
		language: string | undefined = undefined,
	): Promise<ContextItem[]> {
		const workspaceDirs = await ide.getWorkspaceDirectories();

		const nRetrieve = RETRIEVAL_PARAMS.nRetrieve;

		if (workspaceDirs.length === 0) {
			throw new Error("No workspace directories found");
		}

		const branches = (await Promise.race([
			Promise.all(workspaceDirs.map((dir) => ide.getBranch(dir))),
			new Promise((resolve) => {
				setTimeout(() => {
					resolve(["NONE"]);
				}, 500);
			}),
		])) as string[];

		const tags: BranchAndDir[] = workspaceDirs.map((directory, i) => ({
			directory,
			branch: branches[i],
		}));

		// Get all retrieval results
		const retrievalResults: Chunk[] = [];

		// Source: Full-text search
		let ftsResults = await this.retrieveFts(
			fullInput,
			nRetrieve / 2,
			tags,
			filterDirectory,
			language
		);

		channel.appendLine("\n");
		channel.appendLine(`== [Codebase] Found ${ftsResults.length} results from FullTextSearch`);
		retrievalResults.push(...ftsResults);

		// Source: Embeddings
		const lanceDbIndex = new LanceDbIndex(embeddingsProvider, (path) =>
			ide.readFile(path),
		);

		let vecResults: Chunk[] = [];
		try {
			vecResults = await lanceDbIndex.retrieve(
				fullInput,
				nRetrieve,
				tags,
				filterDirectory,
			);
		} catch (e) {
			console.warn("Error retrieving from embeddings:", e);
		}

		channel.appendLine(`== [Codebase] Found ${vecResults.length} results from embeddings`);
		retrievalResults.push(...vecResults);

		// De-duplicate
		let results: Chunk[] = this.deduplicateChunks(retrievalResults);

		if (results.length === 0) {
			throw new Error(
				"Warning: No results found for @codebase context provider.",
			);
		}

		// todo: extends to full code context

		return [
			...results.map((r) => {
				const name = `${getBasename(r.filepath)} (${r.startLine}-${r.endLine})`;
				const description = `${r.filepath} (${r.startLine}-${r.endLine})`;
				return {
					name,
					description,
					content: `\`\`\`${name}\n${r.content}\n\`\`\``,
				};
			})
		];
	}
}

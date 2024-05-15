import { Chunk } from "../chunk/_base/Chunk";
import { IdeAction } from "../../editor/editor-api/IdeAction";
import { BranchAndDir } from "../indexing/_base/CodebaseIndex";
import { LanceDbIndex } from "../indexing/LanceDbIndex";
import { EmbeddingsProvider } from "../embedding/_base/EmbeddingsProvider";
import { getBasename } from "../utils/IndexPathHelper";
import { RETRIEVAL_PARAMS } from "../utils/constants";
import { FullTextSearchCodebaseIndex } from "../search/FullTextSearch";

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

export function deduplicateArray<T>(
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

function deduplicateChunks(chunks: Chunk[]): Chunk[] {
	return deduplicateArray(chunks, (a, b) => {
		return (
			a.filepath === b.filepath &&
			a.startLine === b.startLine &&
			a.endLine === b.endLine
		);
	});
}

export async function retrieveFts(
	query: string,
	n: number,
	tags: BranchAndDir[],
	filterDirectory: string | undefined,
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
			);
		}
		return ftsResults;
	} catch (e) {
		console.warn("Error retrieving from FTS:", e);
		return [];
	}
}

export async function retrieveContextItems(
	fullInput: string,
	ide: IdeAction,
	embeddingsProvider: EmbeddingsProvider,
	filterDirectory: string | undefined,
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
	let ftsResults = await retrieveFts(
		fullInput,
		nRetrieve / 2,
		tags,
		filterDirectory,
	);
	retrievalResults.push(...ftsResults);

	// Source: Embeddings
	const lanceDbIndex = new LanceDbIndex(embeddingsProvider, (path) =>
		ide.readFile(path),
	);

	let vecResults : Chunk[] = [];
	try {
		await lanceDbIndex.retrieve(
			fullInput,
			nRetrieve,
			tags,
			filterDirectory,
		);
	} catch (e) {
		console.warn("Error retrieving from embeddings:", e);
	}
	retrievalResults.push(...vecResults);

	// De-duplicate
	let results: Chunk[] = deduplicateChunks(retrievalResults);

	if (results.length === 0) {
		throw new Error(
			"Warning: No results found for @codebase context provider.",
		);
	}

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

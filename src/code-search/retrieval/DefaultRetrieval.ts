import { Chunk } from "../chunk/_base/Chunk";
import { IdeAction } from "../../editor/editor-api/IdeAction";
import { BranchAndDir } from "../indexing/_base/CodebaseIndex";
import { LanceDbIndex } from "../indexing/LanceDbIndex";
import { EmbeddingsProvider } from "../embedding/_base/EmbeddingsProvider";
import { getBasename } from "../utils/IndexPathHelper";
import { RETRIEVAL_PARAMS } from "../utils/constants";
import { channel } from "../../channel";
import { ContextItem, Retrieval, RetrieveOption } from "./Retrieval";
import { RetrievalQueryTerm } from "./RetrievalQueryTerm";
import { Point, TextRange } from "../scope-graph/model/TextRange";

export class DefaultRetrieval extends Retrieval {
	private static instance: DefaultRetrieval;

	private constructor() {
		super();
	}

	static getInstance() {
		if (!DefaultRetrieval.instance) {
			DefaultRetrieval.instance = new DefaultRetrieval();
		}
		return DefaultRetrieval.instance;
	}

	/// todo: add index types
	async retrieve(
		fullInput: string,
		ide: IdeAction,
		embeddingsProvider: EmbeddingsProvider,
		options: RetrieveOption,
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

		channel.appendLine("\n");

		// Get all retrieval results
		const retrievalResults: Chunk[] = [];

		if (options.withFullTextSearch) {
			// Source: Full-text search
			let ftsResults = await this.retrieveFts(new RetrievalQueryTerm(
				fullInput,
				nRetrieve / 2,
				tags,
				options.filterDirectory,
				options.filterLanguage
			));

			channel.appendLine(`== [Codebase] Found ${ftsResults.length} results from FullTextSearch`);
			retrievalResults.push(...ftsResults);
		}

		if (options.withSemanticSearch) {
			// Source: Embeddings
			const lanceDbIndex = new LanceDbIndex(embeddingsProvider, (path) =>
				ide.readFile(path),
			);

			let vecResults: Chunk[] = [];
			try {
				vecResults = await lanceDbIndex.retrieve(new RetrievalQueryTerm(
					fullInput,
					nRetrieve,
					tags,
					options.filterDirectory,
					options.filterLanguage
				));
			} catch (e) {
				console.warn("Error retrieving from embeddings:", e);
			}

			channel.appendLine(`== [Codebase] Found ${vecResults.length} results from embeddings`);
			retrievalResults.push(...vecResults);
		}

		if (options.withGitChange) {
			// Source: Git
			let gitResults = await this.retrieveGit(ide.git, new RetrievalQueryTerm(
				fullInput,
				nRetrieve / 2,
				tags,
				options.filterDirectory,
				options.filterLanguage
			));

			channel.appendLine(`== [Codebase] Found ${gitResults.length} results from Git`);
			// retrievalResults.push(...gitResults);
			console.log("Git results:", gitResults);
		}

		let results: Chunk[] = this.deduplicateChunks(retrievalResults);
		if (results.length === 0) {
			channel.appendLine(`== [Codebase] No results found for @codebase context provider.`);
			return [];
		}

		// todo: extends to full code context
		return [
			...results.map((r) => {
				const name = `${getBasename(r.filepath)} (${r.startLine}-${r.endLine})`;
				const description = `${r.filepath} (${r.startLine}-${r.endLine})`;
				const range = new TextRange(
					new Point(r.startLine, 0, 0),
					new Point(r.endLine, 0, 0),
					r.content
				);

				return {
					name,
					path: r.filepath,
					range: range,
					description,
					content: `\`\`\`${name}\n${r.content}\n\`\`\``,
				};
			})
		];
	}
}

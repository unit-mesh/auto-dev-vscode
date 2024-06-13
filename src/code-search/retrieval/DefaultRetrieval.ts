import { logger } from 'base/common/log/log';

import { ContextItem } from '../../context-provider/_base/BaseContextProvider';
import { IdeAction } from '../../editor/editor-api/IdeAction';
import { Chunk } from '../chunk/_base/Chunk';
import { EmbeddingsProvider } from '../embedding/_base/EmbeddingsProvider';
import { BranchAndDir } from '../indexing/_base/CodebaseIndex';
import { LanceDbIndex } from '../indexing/LanceDbIndex';
import { Point, TextRange } from '../scope-graph/model/TextRange';
import { RETRIEVAL_PARAMS } from '../utils/constants';
import { getBasename } from '../utils/IndexPathHelper';
import { Retrieval, RetrieveOption } from './Retrieval';
import { RetrievalQueryTerm } from './RetrievalQueryTerm';

export class DefaultRetrieval extends Retrieval {
	constructor(private db: LanceDbIndex) {
		super();
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
			throw new Error('No workspace directories found');
		}

		const branches = (await Promise.race([
			Promise.all(workspaceDirs.map(dir => ide.getBranch(dir))),
			new Promise(resolve => {
				setTimeout(() => {
					resolve(['NONE']);
				}, 500);
			}),
		])) as string[];

		const tags: BranchAndDir[] = workspaceDirs.map((directory, i) => ({
			directory,
			branch: branches[i],
		}));

		logger.appendLine('\n');

		// Get all retrieval results
		const retrievalResults: Chunk[] = [];

		if (options.withFullTextSearch) {
			// Source: Full-text search
			let ftsResults = await this.retrieveFts(
				new RetrievalQueryTerm(fullInput, nRetrieve / 2, tags, options.filterDirectory, options.filterLanguage),
			);

			logger.appendLine(`== [Codebase] Found ${ftsResults.length} results from FullTextSearch`);
			retrievalResults.push(...ftsResults);
		}

		if (options.withSemanticSearch) {
			let vecResults: Chunk[] = [];
			try {
				vecResults = await this.db.retrieve(
					new RetrievalQueryTerm(fullInput, nRetrieve, tags, options.filterDirectory, options.filterLanguage),
				);
			} catch (e) {
				console.warn('Error retrieving from embeddings:', e);
			}

			logger.appendLine(`== [Codebase] Found ${vecResults.length} results from embeddings`);
			retrievalResults.push(...vecResults);
		}

		let isLessThanN = retrievalResults.length < nRetrieve;
		if (options.withCommitMessageSearch && isLessThanN) {
			/**
			 * the Commit content always too loong, if we want to search commit message, we need to reduce the number of retrieval
			 */
			let remaining = (nRetrieve - retrievalResults.length) / 2;

			// Source: Git
			try {
				let gitResults = await this.retrieveGit(
					ide.git,
					new RetrievalQueryTerm(fullInput, remaining, tags, options.filterDirectory, options.filterLanguage),
				);

				logger.appendLine(`== [Codebase] Found ${gitResults.length} results from Git`);
				// retrievalResults.push(...gitResults);
				console.log('Git results:', gitResults);
			} catch (e) {
				console.warn('Error retrieving from git:', e);
			}
		}

		let results: Chunk[] = this.deduplicateChunks(retrievalResults);
		if (results.length === 0) {
			logger.appendLine(`== [Codebase] No results found for @codebase context provider.`);
			return [];
		}

		// todo: extends to full code context
		return [
			...results.map(r => {
				const name = `${getBasename(r.filepath)} (${r.startLine}-${r.endLine})`;
				const description = `${r.filepath} (${r.startLine}-${r.endLine})`;
				const range = new TextRange(new Point(r.startLine, 0, 0), new Point(r.endLine, 0, 0), r.content);

				return {
					name,
					path: r.filepath,
					range: range,
					description,
					content: `\`\`\`${name}\n${r.content}\n\`\`\``,
				};
			}),
		];
	}
}

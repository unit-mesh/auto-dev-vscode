import { logger } from 'base/common/log/log';
import { StreamingMarkdownCodeBlock } from 'base/common/markdown/StreamingMarkdownCodeBlock';

import { AutoDevExtension } from '../../AutoDevExtension';
import { ContextItem } from '../../context-provider/_base/BaseContextProvider';
import { IChatMessage } from 'base/common/language-models/languageModels';
import { PromptManager } from '../../prompt-manage/PromptManager';
import { ChunkItem } from '../embedding/_base/Embedding';
import { DefaultRetrieval } from '../retrieval/DefaultRetrieval';
import { RetrieveOption } from '../retrieval/Retrieval';
import { HydeDocument, HydeDocumentType } from './_base/HydeDocument';
import { HydeStep } from './_base/HydeStep';
import { executeIns, HydeQuery, HydeStrategy } from './_base/HydeStrategy';
import { StrategyFinalPrompt } from './_base/StrategyFinalPrompt';
import { KeywordEvaluateContext, KeywordsProposeContext } from './HydeKeywordsStrategy';

/**
 * Generate hypothetical document base on user input, and then used to retrieve similar code by symbols.
 * Hypothetical Document Embedding (HyDE): https://arxiv.org/abs/2212.10496
 * This class generates synthetic documents based on the query. These are then parsed and code is extracted. This has
 * been shown to improve semantic search recall.
 *
 * First try semantic_search, if no results or few results, then try code_search.
 * In bloop, default will be:
 * ```rust
 * const CODE_SEARCH_LIMIT: u64 = 10;
 * const MINIMUM_RESULTS: usize = CODE_SEARCH_LIMIT as usize / 2;
 * ```
 *
 * Then, extract the Chunk with {@link NamedElement} and {extra_chunks} to class or function.
 * In bloop, function will be like:
 *
 * ```rust
 * let extra_chunks = match self.get_related_chunks(chunks.clone()).await {
 *     Ok(chunks) => chunks,
 *     Err(e) => {
 *         info!(?e, "failed to get related chunks");
 *         vec![]
 *     }
 * };
 * ```
 */
export class HydeCodeStrategy implements HydeStrategy<string> {
	documentType = HydeDocumentType.Code;
	message: IChatMessage[] = [];
	step: HydeStep;
	promptManager: PromptManager;
	retrieval: DefaultRetrieval;

	constructor(
		public query: string,
		private extension: AutoDevExtension,
	) {
		this.step = HydeStep.Propose;
		this.retrieval = extension.retrieval;
		this.promptManager = extension.promptManager;
	}

	async instruction(): Promise<string> {
		let chatContext = await this.promptManager.collectByCurrentDocument();
		let proposeContext: KeywordsProposeContext = {
			step: this.step,
			question: this.query,
			language: '',
			chatContext: chatContext.map(item => item.text).join('\n - '),
		};

		return await this.promptManager.renderHydeTemplate(this.step, this.documentType, proposeContext);
	}

	async generateDocument(): Promise<HydeDocument<string>> {
		let proposeIns = await this.instruction();
		logger.appendLine(' --- Generated Code --- ');
		const proposeOut = await executeIns(proposeIns);
		const code = StreamingMarkdownCodeBlock.parse(proposeOut);
		return new HydeDocument<string>(this.documentType, code.text);
	}

	async retrieveChunks(queryTerm: HydeQuery): Promise<ChunkItem[]> {
		let language = undefined;
		let embeddingsProvider = this.extension.embeddingsProvider;
		let options: RetrieveOption = {
			filterDirectory: undefined,
			filterLanguage: language,
			withFullTextSearch: true,
			withSemanticSearch: true,
			withCommitMessageSearch: false,
		};

		let result: ContextItem[] = await this.retrieval.retrieve(
			queryTerm as string,
			this.extension.ideAction,
			embeddingsProvider,
			options,
		);

		let chunks: ChunkItem[] = [];
		result.forEach((item: ContextItem) => {
			chunks.push({
				text: item.content,
				name: item.name,
				path: item.path,
				range: item.range,
				embedding: [],
			});
		});

		return chunks;
	}

	async clusterChunks(docs: ChunkItem[]): Promise<ChunkItem[]> {
		return docs;
	}

	async execute(): Promise<StrategyFinalPrompt> {
		logger.appendLine('='.repeat(80));
		logger.appendLine(`= Hyde Keywords Strategy: ${this.constructor.name} =`);
		logger.appendLine('='.repeat(80));

		this.step = HydeStep.Propose;
		let documents = await this.generateDocument();
		let hydeCode = documents.content;

		this.step = HydeStep.Retrieve;
		let chunks = await this.retrieveChunks(hydeCode);

		this.step = HydeStep.Evaluate;
		let evaluateContext: KeywordEvaluateContext = {
			step: this.step,
			question: this.query,
			code: chunks.map(item => item.text).join('\n'),
			language: '',
		};

		if (chunks.length === 0) {
			logger.appendLine('No code snippets found.');
			return new StrategyFinalPrompt('', []);
		}

		logger.appendLine('\n');
		logger.appendLine(' --- Summary --- ');
		let evaluateIns = await this.promptManager.renderHydeTemplate(this.step, this.documentType, evaluateContext);
		return new StrategyFinalPrompt(evaluateIns, chunks);
	}
}

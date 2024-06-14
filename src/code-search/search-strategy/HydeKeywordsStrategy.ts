import { IChatMessage } from 'base/common/language-models/languageModels';
import { logger } from 'base/common/log/log';

import { AutoDevExtension } from '../../AutoDevExtension';
import { ContextItem } from '../../context-provider/_base/BaseContextProvider';
import { TemplateContext } from '../../prompt-manage/template/TemplateContext';
import { ChunkItem } from '../embedding/_base/Embedding';
import { RetrieveOption } from '../retrieval/Retrieval';
import { HydeDocument, HydeDocumentType } from './_base/HydeDocument';
import { HydeKeywords } from './_base/HydeKeywords';
import { HydeStep } from './_base/HydeStep';
import { executeIns, HydeQuery, HydeStrategy } from './_base/HydeStrategy';
import { StrategyFinalPrompt } from './_base/StrategyFinalPrompt';

/**
 * The `HydeKeywordsStrategy` class is a part of the Hyde Strategy pattern and is used to generate keywords from a query.
 * These keywords are then used to retrieve similar code by symbols.
 *
 * The class prioritizes the text code, also known as TextDocument, in the following order:
 * - High: Current Document
 * - Medium: Recently Documents
 * - Low: All Documents
 */
export class HydeKeywordsStrategy implements HydeStrategy<HydeKeywords> {
	documentType = HydeDocumentType.Keywords;
	message: IChatMessage[] = [];
	query: string;
	extension: AutoDevExtension;
	step: HydeStep;

	constructor(query: string, extension: AutoDevExtension) {
		this.query = query;
		this.extension = extension;
		this.step = HydeStep.Propose;
	}

	async instruction(): Promise<string> {
		let chatContext = await this.extension.promptManager.collectByCurrentDocument();
		let proposeContext: KeywordsProposeContext = {
			step: this.step,
			question: this.query,
			language: '',
			chatContext: chatContext.map(item => item.text).join('\n - '),
		};

		return await this.extension.promptManager.renderHydeTemplate(this.step, this.documentType, proposeContext);
	}

	async generateDocument(): Promise<HydeDocument<HydeKeywords>> {
		let proposeIns = await this.instruction();
		logger.appendLine(' --- Generated keyword --- ');
		let proposeOut = await executeIns(proposeIns);
		let keywords = HydeKeywords.from(proposeOut);
		return new HydeDocument<HydeKeywords>(this.documentType, keywords);
	}

	async retrieveChunks(queryTerm: HydeQuery): Promise<ChunkItem[]> {
		let language = undefined;
		let embeddingsProvider = this.extension.embeddingsProvider!!;
		let retrieval = this.extension.retrieval;
		let options: RetrieveOption = {
			filterDirectory: undefined,
			filterLanguage: language,
			withFullTextSearch: true,
			withSemanticSearch: true,
			withCommitMessageSearch: true,
		};

		let result: ContextItem[] = await retrieval.retrieve(
			queryTerm as string,
			this.extension.ideAction,
			embeddingsProvider,
			options,
		);

		let chunks: ChunkItem[] = [];
		result.forEach((item: ContextItem) => {
			chunks.push({
				name: item.name,
				text: item.content,
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
		let keywords = documents.content;

		this.step = HydeStep.Retrieve;
		let queryTerm = this.createQueryTerm(keywords);
		let chunkItems = await this.retrieveChunks(queryTerm);

		this.step = HydeStep.Evaluate;
		let evaluateContext: KeywordEvaluateContext = {
			step: this.step,
			question: this.query, // TODO fix keywords.question
			code: chunkItems.map(item => item.text).join('\n'),
			language: '',
		};

		if (chunkItems.length === 0) {
			logger.appendLine('No code snippets found.');
			return new StrategyFinalPrompt('', []);
		}

		logger.appendLine('\n');
		logger.appendLine(' --- Summary --- ');
		let evaluateIns = await this.extension.promptManager.renderHydeTemplate(
			this.step,
			this.documentType,
			evaluateContext,
		);
		return new StrategyFinalPrompt(evaluateIns, chunkItems);
	}

	private createQueryTerm(keywords: HydeKeywords) {
		return keywords.basic?.[0] + ' ' + keywords.single?.[0] + ' ' + keywords.localization?.[0];
	}
}

export interface KeywordsProposeContext extends TemplateContext {
	step: HydeStep;
	question: string;
	chatContext: string;
}

export interface KeywordEvaluateContext extends TemplateContext {
	step: HydeStep;
	question: string;
	code: string;
}

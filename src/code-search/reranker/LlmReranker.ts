import { AutoDevExtension } from 'src/AutoDevExtension';

import { ActionType } from '../../prompt-manage/ActionType';
import { PromptManager } from '../../prompt-manage/PromptManager';
import { TemplateContext } from '../../prompt-manage/template/TemplateContext';
import { Chunk } from '../chunk/_base/Chunk';
import { getBasename } from '../utils/IndexPathHelper';
import { Reranker } from './Reranker';

export interface RerankContext extends TemplateContext {
	query: string;
	documentId: string;
	document: string;
}

const RERANK_PROMPT = async (query: string, documentId: string, document: string, promptManager: PromptManager) => {
	const context: RerankContext = {
		query,
		documentId,
		document,
		language: '',
	};

	let instruction = await promptManager.generateInstruction(ActionType.LlmReranker, context);
	return instruction;
};

/**
 * The LLMReranker class implements the Reranker interface and provides functionality to rerank chunks of text using a language model.
 */
export class LLMReranker implements Reranker {
	name = 'llmReranker';

	constructor(private extension: AutoDevExtension) {}

	async scoreChunk(chunk: Chunk, query: string): Promise<number> {
		let prompt = await RERANK_PROMPT(query, getBasename(chunk.filepath), chunk.content, this.extension.promptManager);

		const completion = await this.extension.lm.completion(prompt);

		if (!completion) {
			// TODO: Why is this happening?
			return 0.0;
		}

		let answer = completion.trim().toLowerCase().replace(/"/g, '').replace(/'/g, '');

		if (answer === 'yes') {
			return 1.0;
		} else if (answer === 'no') {
			return 0.0;
		} else {
			console.warn(`Unexpected response from single token reranker: "${answer}". Expected "yes" or "no".`);
			return 0.0;
		}
	}

	async rerank(query: string, chunks: Chunk[]): Promise<number[]> {
		const scores = await Promise.all(chunks.map(chunk => this.scoreChunk(chunk, query)));
		return scores;
	}
}

import { type GenerateResponse, Ollama } from 'ollama';
import { type CancellationToken, type Progress } from 'vscode';

import { ConfigurationService } from '../../configuration/configurationService';
import type { IChatMessage, IChatResponseFragment, ILanguageModelProvider } from '../languageModels';

export class OllamaLanguageModelProvider implements ILanguageModelProvider {
	readonly identifier = 'ollama';

	constructor(private configService: ConfigurationService) {}

	async provideChatResponse(
		messages: IChatMessage[],
		options: { [name: string]: any },
		progress?: Progress<IChatResponseFragment>,
		token?: CancellationToken,
	): Promise<string> {
		const { model, max_tokens, ...reset } = options;

		const llm = this._newLLM();

		// TODO: Does it affect completion or embedding?
		token?.onCancellationRequested(() => {
			llm.abort();
		});

		const completion = await llm.chat({
			stream: true,
			model: this._resolveChatModel(model),
			messages: messages,
			options: {
				...reset,
				num_predict: max_tokens,
			},
		});

		let content = '';
		let part = '';

		for await (const chunk of completion) {
			part = chunk.message.content;
			content += part;

			progress?.report({ index: 0, part: part });
		}

		return content;
	}

	async provideCompletionResponse(
		input: string,
		options: { [name: string]: any },
		progress?: Progress<IChatResponseFragment>,
		token?: CancellationToken,
	): Promise<string> {
		const { model, stream = true, max_tokens, ...rest } = options;

		const llm = this._newLLM();

		// TODO: Does it affect chat or embedding?
		token?.onCancellationRequested(() => {
			llm.abort();
		});

		const completion = await llm.generate({
			stream: stream,
			model: this._resolveComletionModel(model),
			prompt: input,
			raw: true,
			options: {
				...rest,
				num_predict: max_tokens,
			},
		});

		let content = '';
		let part = '';

		if (stream) {
			for await (const chunk of completion) {
				part = chunk.response;
				content += part;

				progress?.report({ index: 0, part: part });
			}
		} else {
			content = (completion as unknown as GenerateResponse).response;
		}

		return content;
	}

	async provideEmbedDocuments(
		texts: string[],
		options: { [name: string]: any },
		token?: CancellationToken,
	): Promise<number[][]> {
		const { batchSize = 512, model } = options;

		const batches = texts.slice(0, batchSize);

		const llm = this._newLLM();

		// TODO: Does it affect chat or completion?
		token?.onCancellationRequested(() => {
			llm.abort();
		});

		const batchResponses = await Promise.all(
			batches.map(batch =>
				llm.embeddings({
					model: this._resolveEmbeddingModel(model),
					prompt: batch,
				}),
			),
		);
		const embeddings: number[][] = [];

		for (const batchResponse of batchResponses) {
			if (token?.isCancellationRequested) {
				break;
			}

			const embedding = batchResponse.embedding;

			for (let j = 0; j < embedding.length; j += 1) {
				embeddings.push(embedding);
			}
		}

		return embeddings;
	}

	async provideEmbedQuery(
		text: string,
		options: { [name: string]: any },
		token?: CancellationToken,
	): Promise<number[]> {
		const { model, ...rest } = options;

		const llm = this._newLLM();
		const response = await llm.embeddings({
			model: this._resolveEmbeddingModel(model),
			prompt: text,
			options: rest,
		});

		return response.embedding;
	}

	private _newLLM() {
		return new Ollama({
			host: this.configService.get('ollama.baseURL'),
		});
	}

	private _resolveChatModel(model?: string) {
		return model || this.configService.get<string>('ollama.model', 'llama3');
	}

	private _resolveComletionModel(model?: string) {
		return model || this._resolveChatModel(this.configService.get<string>('ollama.completionModel'));
	}

	private _resolveEmbeddingModel(model?: string) {
		return model || this.configService.get<string>('ollama.embeddingModel', 'all-minilm');
	}
}

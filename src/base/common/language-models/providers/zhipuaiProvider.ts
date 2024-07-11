import { OpenAI } from 'openai';
import { type CancellationToken, type Progress } from 'vscode';

import { ConfigurationService } from '../../configuration/configurationService';
import {
	ChatMessageRole,
	type IChatMessage,
	type IChatResponseFragment,
	type ILanguageModelProvider,
} from '../languageModels';

export class ZhipuAILanguageModelProvider implements ILanguageModelProvider {
	readonly identifier = 'zhipuai';
	readonly apiBASE = 'https://open.bigmodel.cn/api/paas/v4/';

	constructor(protected configService: ConfigurationService) {}

	async provideChatResponse(
		messages: IChatMessage[],
		options: { [name: string]: any },
		progress?: Progress<IChatResponseFragment>,
		token?: CancellationToken,
	): Promise<string> {
		const { model, ...rest } = options;

		const llm = this._newLLM(options);

		const ac = new AbortController();

		token?.onCancellationRequested(() => {
			ac.abort();
		});

		const completion = await llm.chat.completions.create(
			{
				...rest,
				stream: true,
				model: this._resolveChatModel(model),
				messages: messages,
			},
			{
				signal: ac.signal,
			},
		);

		let content = '';
		let part: string | undefined | null;

		for await (const chunk of completion) {
			const [choice] = chunk.choices || [];

			part = choice.delta.content;

			// Note: Empty if finish_reason exists.
			if (choice.finish_reason || part == null) {
				break;
			}

			content += part;
			progress?.report({ index: 0, part: part });
		}

		return content;
	}

	async provideCompletionResponse(
		prompt: string,
		options: { [name: string]: any },
		progress?: Progress<IChatResponseFragment>,
		token?: CancellationToken,
	): Promise<string> {
		if (this.configService.get('completions.enableLegacyMode')) {
			return this._legacyCompletionResponse(prompt, options, progress, token);
		}

		return this.provideChatResponse([{ role: ChatMessageRole.User, content: prompt }], options, progress, token);
	}

	protected async _legacyCompletionResponse(
		prompt: string,
		options: { [name: string]: any },
		progress?: Progress<IChatResponseFragment>,
		token?: CancellationToken,
	) {
		const { model, ...rest } = options;

		const ac = new AbortController();

		token?.onCancellationRequested(() => {
			ac.abort();
		});

		const llm = this._newLLM(options);
		const completion = await llm.completions.create(
			{
				...rest,
				stream: true,
				model: this._resolveComletionModel(model),
				prompt: prompt,
			},
			{
				signal: ac.signal,
			},
		);

		let content = '';
		let part = '';

		for await (const chunk of completion) {
			part = chunk.choices[0].text;
			content += part;

			progress?.report({ index: 0, part: part });
		}

		return content;
	}

	async provideEmbedDocuments(
		texts: string[],
		options: { [name: string]: any },
		token?: CancellationToken,
	): Promise<number[][]> {
		const { batchSize = 512, model } = options;

		const ac = new AbortController();

		token?.onCancellationRequested(() => {
			ac.abort();
		});

		const llm = this._newLLM(options);
		const response = await llm.embeddings.create(
			{
				model: this._resolveEmbeddingModel(model),
				input: texts.slice(0, batchSize),
			},
			{
				signal: ac.signal,
			},
		);

		const embeddings: number[][] = [];

		for (const { embedding } of response.data) {
			for (let j = 0; j < embedding.length; j += 1) {
				embeddings.push(embedding);
			}
		}

		return embeddings;
	}

	async provideEmbedQuery(
		input: string | string[],
		options: { [name: string]: any },
		token?: CancellationToken,
	): Promise<number[]> {
		const { model } = options;

		const ac = new AbortController();

		token?.onCancellationRequested(() => {
			ac.abort();
		});

		const llm = this._newLLM(options);
		const response = await llm.embeddings.create(
			{
				model: this._resolveEmbeddingModel(model),
				input: input,
			},
			{
				signal: ac.signal,
			},
		);

		return response.data[0]['embedding'];
	}

	private _newLLM(options: { [name: string]: any }) {
		const config = this.configService;
		const {
			apiKey = config.get('zhipuai.apiKey'),
		} = options;

		return new OpenAI({
			baseURL: this.apiBASE,
			apiKey: apiKey
		});
	}

	private _resolveChatModel(model?: string) {
		if (model) {
			return model;
		}

		return this.configService.get<string>('zhipuai.model', 'codegeex-4');
	}

	private _resolveComletionModel(model?: string) {
		return model || this._resolveChatModel(this.configService.get<string>('zhipuai.model'));
	}

	private _resolveEmbeddingModel(model?: string) {
		return model || 'embedding-2';
	}
}

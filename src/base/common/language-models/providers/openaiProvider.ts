import _ from 'lodash';
import { AzureOpenAI, OpenAI } from 'openai';
import { type CancellationToken, type Progress } from 'vscode';

import { ConfigurationService } from '../../configuration/configurationService';
import {
	ChatMessageRole,
	type IChatMessage,
	type IChatResponseFragment,
	type ILanguageModelProvider,
} from '../languageModels';

export class OpenAILanguageModelProvider implements ILanguageModelProvider {
	readonly identifier = 'openai';

	constructor(private configService: ConfigurationService) {}

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
		let part = '';

		for await (const chunk of completion) {
			part = chunk.choices[0].delta.content!;
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

	private async _legacyCompletionResponse(
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
		const { baseURL, apiKey, project, organization } = options;
		const configService = this.configService;

		const apiType = configService.get<'openai' | 'azure'>('openai.apiType');

		if (apiType === 'azure') {
			return new AzureOpenAI({
				baseURL: baseURL || configService.get('openai.baseURL'),
				apiKey: apiKey || configService.get('openai.apiKey'),
				deployment: organization || configService.get('openai.organization'),
			});
		}

		return new OpenAI({
			baseURL: configService.get('openai.baseURL'),
			project: project || configService.get('openai.project'),
			apiKey: apiKey || configService.get('openai.apiKey'),
			organization: organization || configService.get('openai.organization'),
		});
	}

	private _resolveChatModel(model?: string) {
		if (model) {
			return model;
		}

		return this.configService.get<string>('openai.model', 'gpt-3.5-turbo');
	}

	private _resolveComletionModel(model?: string) {
		return model || this._resolveChatModel(this.configService.get<string>('openai.completionModel'));
	}

	private _resolveEmbeddingModel(model?: string) {
		return model || 'all-minilm-l6';
	}
}

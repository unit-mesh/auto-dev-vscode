import { ChatAnthropic } from '@langchain/anthropic';
import { ChatMessage } from '@langchain/core/messages';
import { type CancellationToken, type Progress } from 'vscode';

import { ConfigurationService } from '../../configuration/configurationService';
import {
	ChatMessageRole,
	type IChatMessage,
	type IChatResponseFragment,
	type ILanguageModelProvider,
} from '../languageModels';

export class AnthropicLanguageModelProvider implements ILanguageModelProvider {
	readonly identifier = 'anthropic';

	constructor(private configService: ConfigurationService) {}

	async provideChatResponse(
		messages: IChatMessage[],
		options: { [name: string]: any },
		progress?: Progress<IChatResponseFragment>,
		token?: CancellationToken,
	): Promise<string> {
		const llm = this._newLLM(options);
		const ac = new AbortController();

		token?.onCancellationRequested(() => {
			ac.abort();
		});

		const completion = await llm.stream(
			messages.map(raw => {
				return new ChatMessage(raw);
			}),
			{
				signal: ac.signal,
			},
		);

		let content = '';
		let part = '';

		for await (const chunk of completion) {
			part = chunk.content.toString();
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
		return this.provideChatResponse([{ role: ChatMessageRole.User, content: input }], options, progress, token);
	}

	async provideEmbedDocuments(
		texts: string[],
		options: { [name: string]: any },
		token?: CancellationToken,
	): Promise<number[][]> {
		throw new Error('This method is not implemented');
	}

	async provideEmbedQuery(
		text: string,
		options: { [name: string]: any },
		token?: CancellationToken,
	): Promise<number[]> {
		throw new Error('This method is not implemented');
	}

	private _newLLM(options: { [name: string]: any }) {
		const config = this.configService;
		const {
			model,
			baseURL = config.get('anthropic.baseURL'),
			apiKey = config.get('anthropic.apiKey'),
			temperature,
			maxTokens,
			topP,
			clientOptions = {}
		} = options;

		return new ChatAnthropic({
			anthropicApiKey: apiKey,
			anthropicApiUrl: baseURL,
			streaming: true,
			temperature,
			maxTokens,
			topP,
			model: this._resolveChatModel(model),
			...clientOptions,
		});
	}

	private _resolveChatModel(model?: string) {
		return model || this.configService.get<string>('anthropic.model', 'claude-2.0');
	}
}

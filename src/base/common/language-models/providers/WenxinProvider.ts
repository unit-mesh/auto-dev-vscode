import { ChatMessage } from '@langchain/core/messages';
import _ from 'lodash';
import { type CancellationToken, type Progress } from 'vscode';

import { ConfigurationService } from '../../configuration/configurationService';
import { ChatBaiduWenxin } from '../chat-models/qianfan';
import {
	ChatMessageRole,
	type IChatMessage,
	type IChatResponseFragment,
	type ILanguageModelProvider,
} from '../languageModels';

export class WenxinLanguageModelProvider implements ILanguageModelProvider {
	readonly identifier = 'qianfan';

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
			temperature,
			penaltyScore,
			topP,
			apiKey = config.get<string>('qianfan.apiKey'),
			secretKey = config.get('qianfan.secretKey'),
			clientOptions = {},
		} = options;

		return new ChatBaiduWenxin({
			baiduApiKey: apiKey,
			baiduSecretKey: secretKey,
			streaming: true,
			model: this._resolveChatModel(model),
			temperature: temperature,
			topP: topP,
			penaltyScore: penaltyScore,
			...clientOptions,
		});
	}

	private _resolveChatModel(model?: string) {
		return model || this.configService.get<string>('qianfan.model', 'ERNIE-Bot-turbo');
	}
}

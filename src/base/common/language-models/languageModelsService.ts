import { inject, injectable } from 'inversify';
import { type CancellationToken, Progress } from 'vscode';

import { EMBEDDING_BATCH_SIZE } from '../configuration/configuration';
import { ConfigurationService } from '../configuration/configurationService';
import { IChatMessage, IChatResponseFragment, ILanguageModelProvider } from './languageModels';
import { HuggingFaceTransformersLanguageModelProvider } from './providers/hgTransformersLMProvider';
import { OllamaLanguageModelProvider } from './providers/ollamaLMProvider';
import { OpenAILanguageModelProvider } from './providers/openaiLMProvider';

export interface LanguageModelSelector {
	/**
	 * The identifier of a language model provider.
	 * @see {@link ILanguageModelProvider.identifier}
	 */
	provider?: string;

	/**
	 * The name of a language model.
	 */
	model?: string;
}

@injectable()
export class LanguageModelsService {
	private _providers: Map<string, ILanguageModelProvider>;

	constructor(
		@inject(ConfigurationService)
		private configService: ConfigurationService,
	) {
		this._providers = new Map<string, ILanguageModelProvider>([
			['openai', new OpenAILanguageModelProvider(configService)],
			['ollama', new OllamaLanguageModelProvider(configService)],
			['transformers', new HuggingFaceTransformersLanguageModelProvider(configService)],
		]);
	}

	chat(
		messages: IChatMessage[],
		options: { [name: string]: any },
		progress?: Progress<IChatResponseFragment>,
		token?: CancellationToken,
	): Promise<string> {
		const configService = this.configService;

		const { provider, model = configService.get('chat.model'), ...rest } = options;

		const lm = this.resolveChatModel({ provider });
		return lm.provideChatResponse(messages, { model, ...rest }, progress, token);
	}

	completion(
		prompt: string,
		options?: { [name: string]: any },
		progress?: Progress<IChatResponseFragment>,
		token?: CancellationToken,
	) {
		const { provider, model = this.configService.get('completions.model'), ...rest } = options || {};

		const lm = this.resolveCompletionModel({ provider });
		return lm.provideCompletionResponse(prompt, { model, ...rest }, progress, token);
	}

	embedDocuments(texts: string[], options?: { [name: string]: any }, token?: CancellationToken): Promise<number[][]> {
		const configService = this.configService;

		const { provider, model = configService.get('embeddings.model'), ...rest } = options || {};

		const lm = this.resolveEmbeddingModel({ provider });
		return lm.provideEmbedDocuments(texts, { model, ...rest }, token);
	}

	embedQuery(text: string, options?: { [name: string]: any }, token?: CancellationToken): Promise<number[]> {
		const configService = this.configService;

		const {
			provider,
			model = configService.get('embeddings.model'),
			batchSize = configService.get<number>('embeddings.batchSize', EMBEDDING_BATCH_SIZE),
			...rest
		} = options || {};

		const lm = this.resolveEmbeddingModel({ provider });
		return lm.provideEmbedQuery(text, { model, batchSize, ...rest }, token);
	}

	resolveChatModel(selector: LanguageModelSelector): ILanguageModelProvider {
		const configService = this.configService;
		const { provider = configService.get<string>('chat.provider') } = selector;

		const model = this._providers.get(provider);

		if (!model) {
			throw new Error(`Language Model ${provider} is not found`);
		}

		return model;
	}

	resolveCompletionModel(selector: LanguageModelSelector): ILanguageModelProvider {
		const configService = this.configService;
		const { provider = configService.get<string>('completions.provider') } = selector;

		const model = this._providers.get(provider);

		if (model) {
			return model;
		}

		// fallback to chat model
		return this.resolveChatModel({});
	}

	resolveEmbeddingModel(selector: LanguageModelSelector): ILanguageModelProvider {
		const configService = this.configService;
		const { provider = configService.get<string>('embeddings.provider') } = selector;

		const model = this._providers.get(provider);

		if (!model) {
			throw new Error(`Language Model ${provider} is not found`);
		}

		return model;
	}

	dispose() {
		// pass
	}
}

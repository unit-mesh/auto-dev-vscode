import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { chunkArray } from '@langchain/core/utils/chunk_array';
import {
	type FeatureExtractionPipeline, // @ts-expect-error vite esm => cjs
} from '@xenova/transformers';
import { type CancellationToken } from 'vscode';

import { ConfigurationService } from '../../configuration/configurationService';
import { type ILanguageModelProvider } from '../languageModels';

// see https://github.com/xenova/transformers.js/issues/19
// see https://github.com/microsoft/onnxruntime/issues/13072
(globalThis as unknown as any).self = globalThis;

interface HuggingFaceTransformersParams {
	model: string;
	remoteHost: string;
	remotePathTemplate: string;
	allowLocalModels: boolean;
	localModelPath: string | null;
	onnxWasmNumThreads: 'auto' | number | null;
	logLevel: 'verbose' | 'info' | 'warning' | 'error' | 'fatal';
}

const defaults: HuggingFaceTransformersParams = {
	model: 'all-MiniLM-L6-v2',
	remoteHost: 'https://huggingface.co',
	remotePathTemplate: '{model}/resolve/{revision}/',
	allowLocalModels: true,
	localModelPath: null,
	onnxWasmNumThreads: null,
	logLevel: 'error',
};

export class HuggingFaceTransformersLanguageModelProvider implements ILanguageModelProvider {
	private _pipelinePromise?: Promise<FeatureExtractionPipeline>;
	private _model?: string;

	readonly identifier = 'transformers';

	constructor(private configService: ConfigurationService) {
		configService.onDidChange(event => {
			if (event.affectsConfiguration('autodev.transformers')) {
				this._upgradeConfiguration();
			}
		});

		this._upgradeConfiguration();
	}

	async provideChatResponse(): Promise<never> {
		throw new Error('This method is not implemented');
	}

	async provideCompletionResponse(): Promise<never> {
		throw new Error('This method is not implemented');
	}

	async provideEmbedDocuments(
		texts: string[],
		options: { [name: string]: any },
		token?: CancellationToken,
	): Promise<number[][]> {
		const { batchSize = 512, model } = options;

		const batches = chunkArray(texts, batchSize);

		const batchRequests = await Promise.all(
			batches.map(batch => this._runEmbedding(this._resolveEmbeddingModel(model), batch, options, token)),
		);

		const embeddings: number[][] = [];

		for (const batchResponse of batchRequests) {
			if (token?.isCancellationRequested) {
				break;
			}

			for (let j = 0; j < batchResponse.length; j += 1) {
				embeddings.push(batchResponse[j]);
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

		const data = await this._runEmbedding(
			this._resolveEmbeddingModel(model),
			Array.isArray(input) ? input : [input],
			options,
			token,
		);

		return data[0] || [];
	}

	private async _runEmbedding(
		model: string,
		texts: string[],
		options: { [name: string]: any },
		token?: CancellationToken,
	) {
		const pipe = await this._pipeline(model);

		if (token?.isCancellationRequested) {
			return [];
		}

		// TODO How do I stop a model run??
		const output = await pipe(texts, { pooling: 'mean', normalize: true });

		return output.tolist();
	}

	private _resolveEmbeddingModel(model?: string) {
		if (model) {
			return model;
		}

		return this.configService.get<string>('transformers.model', 'all-MiniLM-L6-v2');
	}

	private async _pipeline(model: string): Promise<FeatureExtractionPipeline> {
		const { pipeline } = await import('@xenova/transformers');

		if (this._model === model) {
			// Note: cache-first (computing)
			this._pipelinePromise ??= pipeline('feature-extraction', model);
		} else {
			this._pipelinePromise = pipeline('feature-extraction', model);
		}

		this._model = model;

		return this._pipelinePromise;
	}

	private async _upgradeConfiguration() {
		const configService = this.configService;
		const { env } = await import('@xenova/transformers');

		const valueGetter = <Name extends keyof HuggingFaceTransformersParams>(
			name: Name,
		): HuggingFaceTransformersParams[Name] => {
			return configService.get(`transformers.${name}`, defaults[name]);
		};

		env.remoteHost = valueGetter('remoteHost');
		env.remotePathTemplate = valueGetter('remotePathTemplate');

		// NOTE: Enabled or disable the internal embedding models
		// The extension has a built-in embedding model, prevent users from overwriting the model paths
		// If you must disable local adoption of an external, use a remote cache to overwrite the
		const allowLocalModels = valueGetter('allowLocalModels');

		if (allowLocalModels) {
			env.allowLocalModels = true;
			const internalModelsUri = configService.extensionJoinPath('dist', 'models');
			env.localModelPath = fileURLToPath(internalModelsUri.toString());
		} else {
			env.allowLocalModels = false;
		}

		const localModelPath = valueGetter('localModelPath');

		if (localModelPath) {
			// ~/.autodev/models
			if (localModelPath.startsWith('~')) {
				env.cacheDir = path.join(localModelPath.replace('~', ''), os.homedir());
			} else {
				// Maybe cache into the current workspace
				env.cacheDir = configService.joinPath(localModelPath);
			}
		} else {
			// Default cache into home directory
			env.cacheDir = path.join(os.homedir(), '.autodev', 'models');
		}

		const numThreads = valueGetter('onnxWasmNumThreads');

		if (numThreads === 'auto') {
			env.backends.onnx.wasm.numThreads = os.cpus().length;
		} else if (typeof numThreads === 'number') {
			env.backends.onnx.wasm.numThreads = numThreads;
		} else {
			// see https://github.com/microsoft/onnxruntime/issues/17274#issuecomment-1692587686
			env.backends.onnx.wasm.numThreads = 1;
		}

		env.backends.onnx.logLevel = valueGetter('logLevel');
	}
}

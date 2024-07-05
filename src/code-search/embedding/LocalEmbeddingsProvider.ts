import { InferenceSession, Tensor as ONNXTensor } from 'onnxruntime-common';
import path from 'path';

import { Embedding } from './_base/Embedding';
import { EmbeddingsProvider } from './_base/EmbeddingsProvider';
import { mean_pooling, mergedTensor, normalize_, reshape, tensorData } from './_base/EmbeddingUtils';
import { logger } from 'base/common/log/log';
import type { ILanguageModelProvider } from "base/common/language-models/languageModels";
import { CancellationToken } from 'vscode';

// @ts-expect-error
const ortPromise = import('onnxruntime-node');

const InferenceSessionCreate = (...args: any[]) => {
	return ortPromise.then(ort => {
		return ort.InferenceSession.create(...args);
	});
};

/**
 * Which will use ONNXRuntime and all-MiniLM-L6-v2 to embed the text.
 *
 * @deprecated Please use LanguageModelsService instead.
 */
export class LocalEmbeddingsProvider implements EmbeddingsProvider, ILanguageModelProvider {
	id: string = 'local';
	env: any;
	tokenizer: any;
	session: InferenceSession | undefined;
	MaxGroupSize: number = 4;
	MaxChunkSize: number = 512;

	private static instance: LocalEmbeddingsProvider;

	private constructor() {
	}

	identifier: string = 'local';

	async provideChatResponse(): Promise<never> {
		throw new Error('This method is not implemented');
	}

	async provideCompletionResponse(): Promise<never> {
		throw new Error('This method is not implemented');
	}

	static getInstance(): LocalEmbeddingsProvider {
		if (!LocalEmbeddingsProvider.instance) {
			LocalEmbeddingsProvider.instance = new LocalEmbeddingsProvider();
			LocalEmbeddingsProvider.instance.init();
		}

		return LocalEmbeddingsProvider.instance;
	}

	async init(basepath: string = __dirname) {
		if (this.session) {
			return;
		}

		const { env, AutoTokenizer } = await import('@xenova/transformers');
		this.env = env;
		env.allowLocalModels = true;
		let modelPath = path.join(basepath, 'models', 'all-MiniLM-L6-v2', 'onnx', 'model_quantized.onnx');
		let modelBase = path.join('.', 'all-MiniLM-L6-v2');

		this.tokenizer = await AutoTokenizer.from_pretrained(modelBase, {
			quantized: true,
			local_files_only: true,
		});

		this.session = await InferenceSessionCreate(modelPath, {
			executionProviders: ['cpu'],
		});

		logger.appendLine('embedding provider initialized');
		let value = await this.embed(['hello']);
		logger.appendLine("'hello' text's first 10 values" + value[0].slice(0, 10).join(', '));
	}

	async provideEmbedDocuments(
			texts: string[],
			options: { [name: string]: any },
			token?: CancellationToken,
	): Promise<number[][]> {
		return this.embed(texts);
	}

	async provideEmbedQuery(
			input: string | string[],
			options: { [name: string]: any },
			token?: CancellationToken,
	): Promise<number[]> {
		return (await this.embed(Array.isArray(input) ? input : [input]))[0];
	}

	async embed(chunks: string[]): Promise<Embedding[]> {
		if (chunks.length === 0) {
			return [];
		}

		let outputs = [];
		for (let i = 0; i < chunks.length; i += this.MaxGroupSize) {
			let chunkGroup = chunks.slice(i, i + this.MaxGroupSize);
			for (const chunksString of chunkGroup) {
				try {
					let embededChunk = await this.embedChunk(chunksString);
					outputs.push(embededChunk);
				} catch (e) {
					logger.appendLine('Failed to embed chunk' + e?.toString());
					// try reembedding by reduce the chunk string to two chunk string
					try {
						logger.appendLine('Try to re-embed by reducing the chunk string to two chunk string');
						let half = Math.floor(chunksString.length / 2);
						let firstHalf = chunksString.substring(0, half);
						let secondHalf = chunksString.substring(half);
						outputs.push(await this.embedChunk(firstHalf));
						outputs.push(await this.embedChunk(secondHalf));
					} catch (e) {
						logger.appendLine('Failed to re-embed chunk' + e?.toString());
					}
				}
			}
		}

		return outputs;
	}

	private async embedChunk(sequence: string): Promise<Embedding> {
		const { Tensor } = await import('@xenova/transformers');
		let encodings = this.tokenizer(sequence);

		// if dims > 512
		if ((encodings.input_ids.dims?.[1] ?? 0) > this.MaxChunkSize) {
			console.warn('Input sequence is too long, skipping embedding: ' + sequence);
			return [];
		}

		const inputIdsTensor = new ONNXTensor('int64', tensorData(encodings.input_ids), encodings.input_ids.dims);
		const attentionMaskTensor = new ONNXTensor(
			'int64',
			tensorData(encodings.attention_mask),
			encodings.attention_mask.dims,
		);
		const tokenTypeIdsTensor = new ONNXTensor(
			'int64',
			tensorData(encodings.token_type_ids),
			encodings.token_type_ids.dims,
		);

		const outputs: InferenceSession.ReturnType = await this.session!!.run({
			input_ids: inputIdsTensor,
			attention_mask: attentionMaskTensor,
			token_type_ids: tokenTypeIdsTensor,
		});

		let result = outputs.last_hidden_state ?? outputs.logits;
		// @ts-ignore
		let infer = new Tensor('float32', new Float32Array(tensorData(result)), result.dims);
		let output = await mean_pooling(infer, encodings.attention_mask);

		let tensor = new Tensor(mergedTensor(output));
		let final = normalize_(mergedTensor(tensor), 2.0, 1);
		return reshape(final.data, final.dims as any)[0];
	}
}

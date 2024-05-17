import path from "path";

import { InferenceSession, Tensor as ONNXTensor } from "onnxruntime-common";
import { mean_pooling, mergedTensor, normalize_, reshape, tensorData } from "./_base/EmbeddingUtils";
import { EmbeddingsProvider } from "./_base/EmbeddingsProvider";
import { Embedding } from "./_base/Embedding";
import { channel } from "../../channel";

// @ts-expect-error
const ortPromise = import('onnxruntime-node');

const InferenceSessionCreate = (...args: any[]) => {
	return ortPromise.then(ort => {
		return ort.InferenceSession.create(...args);
	});
};

/**
 * Which will use ONNXRuntime and all-MiniLM-L6-v2 to embed the text.
 */
export class LocalEmbeddingProvider implements EmbeddingsProvider {
	id: string = "local";
	env: any;
	tokenizer: any;
	session: InferenceSession | undefined;
	MaxGroupSize: number = 4;

	// singleton
	private static instance: LocalEmbeddingProvider;

	private constructor() {
	}

	static getInstance(): LocalEmbeddingProvider {
		if (!LocalEmbeddingProvider.instance) {
			LocalEmbeddingProvider.instance = new LocalEmbeddingProvider();
		}
		return LocalEmbeddingProvider.instance;
	}

	async init(basepath: string = __dirname) {
		const { env, AutoTokenizer } = await import('@xenova/transformers');
		this.env = env;
		env.allowLocalModels = true;
		let modelPath = path.join(basepath, "models", "all-MiniLM-L6-v2", "onnx", "model_quantized.onnx");
		let modelBase = path.join(".", "all-MiniLM-L6-v2");

		this.tokenizer = await AutoTokenizer.from_pretrained(modelBase, {
			quantized: true,
			local_files_only: true,
		});

		this.session = await InferenceSessionCreate(modelPath, {
			executionProviders: ['cpu']
		});

		channel.appendLine("embedding provider initialized");
		// console.log(await this.embed(['blog']));
	}

	async embed(chunks: string[]): Promise<Embedding[]> {
		if (chunks.length === 0) {
			return [];
		}

		let outputs = [];
		for (let i = 0; i < chunks.length; i += this.MaxGroupSize) {
			let chunkGroup = chunks.slice(i, i + this.MaxGroupSize,);
			for (const chunk of chunkGroup) {
				outputs.push(await this.embedChunk(chunk));
			}
		}

		return outputs;
	}

	private async embedChunk(sequence: string) {
		const { Tensor } = await import('@xenova/transformers');
		let encodings = this.tokenizer(sequence);

		const inputIdsTensor = new ONNXTensor('int64', tensorData(encodings.input_ids), encodings.input_ids.dims);
		const attentionMaskTensor = new ONNXTensor('int64', tensorData(encodings.attention_mask), encodings.attention_mask.dims);
		const tokenTypeIdsTensor = new ONNXTensor('int64', tensorData(encodings.token_type_ids), encodings.token_type_ids.dims);

		const outputs: InferenceSession.ReturnType = await this.session!!.run({
			input_ids: inputIdsTensor,
			attention_mask: attentionMaskTensor,
			token_type_ids: tokenTypeIdsTensor
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

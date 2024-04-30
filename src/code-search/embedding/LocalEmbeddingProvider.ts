import path from "path";

import { InferenceSession, Tensor as ONNXTensor } from "onnxruntime-common";
import { mean_pooling, reshape } from "./_base/EmbeddingUtils";
import { EmbeddingsProvider } from "./_base/EmbeddingsProvider";
import { Embedding } from "./_base/Embedding";

const ort = require('onnxruntime-node');

export class LocalEmbeddingProvider implements EmbeddingsProvider {
	id: string = "local";
	env: any;
	tokenizer: any;
	session: InferenceSession | undefined;

	async init() {
		const { env, AutoTokenizer } = await import('@xenova/transformers');
		this.env = env;
		env.allowLocalModels = true;
		let modelPath = path.join(__dirname, "models", "all-MiniLM-L6-v2", "onnx", "model_quantized.onnx");

		this.tokenizer = await AutoTokenizer.from_pretrained("all-MiniLM-L6-v2", {
			local_files_only: true,
		});

		this.session = await ort.InferenceSession.create(modelPath, {
			executionProviders: ['cpu']
		});
	}

	async embed(chunks: string[]): Promise<Embedding[]> {
		let embeddings = [];
		for (let i = 0; i < chunks.length; i++) {
			let chunk = chunks[i];
			let embedding = await this.embedChunk(chunk);
			embeddings.push(embedding);
		}

		return embeddings;
	}

	private async embedChunk(sequence: string) {
		const { Tensor } = await import('@xenova/transformers');
		let encodings = this.tokenizer(sequence);

		const inputIdsTensor = new ONNXTensor('int64', new BigInt64Array(encodings.input_ids.cpuData), encodings.input_ids.dims);
		const attentionMaskTensor = new ONNXTensor('int64', new BigInt64Array(encodings.attention_mask.cpuData), encodings.attention_mask.dims);
		const tokenTypeIdsTensor = new ONNXTensor('int64', new BigInt64Array(encodings.token_type_ids.cpuData), encodings.token_type_ids.dims);

		const outputs: InferenceSession.ReturnType = await this.session!!.run({
			input_ids: inputIdsTensor,
			attention_mask: attentionMaskTensor,
			token_type_ids: tokenTypeIdsTensor
		});

		let result = outputs.last_hidden_state ?? outputs.logits;
		// @ts-ignore
		let infer = new Tensor('float32', new Float32Array(result.cpuData), result.dims);
		let output = mean_pooling(infer, encodings.attention_mask);

		return reshape(output.data, output.dims as any);
	}
}


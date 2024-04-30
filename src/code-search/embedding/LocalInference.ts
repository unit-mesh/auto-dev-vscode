import path from "path";

import { InferenceSession, Tensor as ONNXTensor } from "onnxruntime-common";
import { mean_pooling, reshape } from "./meanPooling";

const ort = require('onnxruntime-node');

export class LocalInference {
	async embed(sequence: string): Promise<any> {
		const { env, AutoTokenizer, Tensor } = await import('@xenova/transformers');

		env.allowLocalModels = true;
		let modelPath = path.join(__dirname, "models", "all-MiniLM-L6-v2", "onnx", "model_quantized.onnx");

		// try {
		let tokenizer = await AutoTokenizer.from_pretrained("all-MiniLM-L6-v2", {
			local_files_only: true,
		});

		let encodings = tokenizer(sequence);

		let session: InferenceSession = await ort.InferenceSession.create(modelPath, {
			executionProviders: ['cpu']
		});

		const inputIdsTensor = new ONNXTensor('int64', new BigInt64Array(encodings.input_ids.cpuData), encodings.input_ids.dims);
		const attentionMaskTensor = new ONNXTensor('int64', new BigInt64Array(encodings.attention_mask.cpuData), encodings.attention_mask.dims);
		const tokenTypeIdsTensor = new ONNXTensor('int64', new BigInt64Array(encodings.token_type_ids.cpuData), encodings.token_type_ids.dims);

		const outputs: InferenceSession.ReturnType = await session.run({
			input_ids: inputIdsTensor,
			attention_mask: attentionMaskTensor,
			token_type_ids: tokenTypeIdsTensor
		});

		let result = outputs.last_hidden_state ?? outputs.logits;
		// @ts-ignore
		let infer = new Tensor('float32', new Float32Array(result.cpuData), result.dims);
		let output = mean_pooling(infer, encodings.attention_mask);

		let final = reshape(output.data, output.dims as any);
		return final;
	}
}


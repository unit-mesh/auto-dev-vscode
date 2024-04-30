import path from "path";

const ort = require('onnxruntime-node');

export class LocalInference {
	async embed(sequence: string): Promise<any> {
		const { env, AutoTokenizer } = await import('@xenova/transformers');
		env.allowLocalModels = true;
		let modelPath = path.join(__dirname, "models", "all-MiniLM-L6-v2", "onnx", "model_quantized.onnx");

		// try {
		let tokenizer = await AutoTokenizer.from_pretrained("all-MiniLM-L6-v2", {
			local_files_only: true,
		});

		let encodings = tokenizer(sequence);

		let session = await ort.InferenceSession.create(modelPath);

		const sequenceLength = encodings.input_ids.size;
		console.log(sequenceLength);

		const inputIdsTensor = new ort.Tensor('int64', new BigInt64Array(sequenceLength), encodings.input_ids);
		const attentionMaskTensor = new ort.Tensor('int64', new BigInt64Array(sequenceLength), encodings.attention_mask);
		const tokenTypeIdsTensor = new ort.Tensor('int64', new BigInt64Array(sequenceLength), encodings.token_type_ids);

		const outputs = await session.run({
			inputIds: inputIdsTensor,
			attentionMask: attentionMaskTensor,
			tokenTypeIds: tokenTypeIdsTensor
		});

		console.log(outputs);

		const outputTensor = outputs[0].extractTensor();
		const sequenceEmbedding = outputTensor.data;
		const pooled = sequenceEmbedding.mean(); // Assuming you have a mean function for arrays

		let results = pooled.toArray();
		console.log(results);
		return results;
	}
}
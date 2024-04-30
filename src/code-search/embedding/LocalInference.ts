import path from "path";
import { Embedding } from "./_base/Embedding";

const ort = require('onnxruntime-node');

export class LocalInference {

	async embed(sequence: string): Promise<Embedding> {
		const { env, PreTrainedTokenizer } = await import('@xenova/transformers');
		env.allowLocalModels = true;

		let tokenizer = await PreTrainedTokenizer.from_pretrained("all-MiniLM-L6-v2", {
			local_files_only: true,
		});

		let encodings = tokenizer.encode(sequence);

		console.log(encodings);

		return Promise.resolve([]);
	}
}
import { Embedding } from "./_base/Embedding";

import { LocalEmbeddingProvider } from "./_base/LocalEmbeddingProvider";
import path from "path";

const { env, pipeline } = require("@xenova/transformers");

env.allowLocalModels = true;
env.allowRemoteModels = false;
if (typeof window === "undefined") {
	// The embeddings provider should just never be called in the browser
	(env as any).localModelPath = path.join(__dirname, "..", "models");
}

class EmbeddingsPipeline {
	static task = "feature-extraction";
	static model = "all-MiniLM-L6-v2";
	static instance: any | null = null;

	static async getInstance() {
		if (this.instance === null) {
			this.instance = await pipeline(this.task, this.model);
		}

		return this.instance;
	}
}

export class TransformersEmbeddingProvider implements LocalEmbeddingProvider {
	id = "transformersJs";

	static MaxGroupSize: number = 4;

	async embed(chunks: string[]): Promise<Embedding[]> {
		let extractor = await EmbeddingsPipeline.getInstance();

		if (!extractor) {
			throw new Error("TransformerJS embeddings pipeline is not initialized");
		}

		if (chunks.length === 0) {
			return [];
		}

		let outputs = [];
		for (
			let i = 0;
			i < chunks.length;
			i += TransformersEmbeddingProvider.MaxGroupSize
		) {
			let chunkGroup = chunks.slice(
				i,
				i + TransformersEmbeddingProvider.MaxGroupSize,
			);
			let output = await extractor(chunkGroup, {
				pooling: "mean",
				normalize: true,
			});
			outputs.push(...output.tolist());
		}
		return outputs;
	}
}

import path from "path";
import { Embedding } from "./_base/Embedding";

import { BaseEmbeddingsProvider } from "./_base/BaseEmbeddingsProvider";
import { channel } from "../../channel";

class EmbeddingsPipeline {
	static task = "feature-extraction";
	static model = "all-MiniLM-L6-v2";
	static instance: any | null = null;

	static async getInstance() {
		console.log("executionProviders for ONNX");
		console.log(typeof process !== 'undefined' && process?.release?.name === 'node');
		const { env, pipeline } = await import("@xenova/transformers");

		channel.appendLine("onnx backends: " + env.backends.onnx);

		env.allowLocalModels = true;
		env.allowRemoteModels = false;
		if (typeof (window as any) === "undefined") {
			// The embeddings provider should just never be called in the browser
			(env as any).localModelPath = path.join(__dirname, "..", "models");
		}

		if (this.instance === null) {
			this.instance = await pipeline(this.task as any, this.model);
		}

		return this.instance;
	}
}

/**
 * @deprecated Please use @{link LocalEmbeddingProvider} instead.
 *
 */
export class TransformersEmbeddingsProvider implements BaseEmbeddingsProvider {
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
			i += TransformersEmbeddingsProvider.MaxGroupSize
		) {
			let chunkGroup = chunks.slice(
				i,
				i + TransformersEmbeddingsProvider.MaxGroupSize,
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

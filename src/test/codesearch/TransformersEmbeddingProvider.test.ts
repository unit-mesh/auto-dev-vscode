import { TransformersEmbeddingProvider } from "../../code-search/embedding/TransformersEmbeddingProvider";

describe('TransformersEmbeddingProvider', () => {
	it.skip('should chunk for hello, world', async () => {
		let provider = new TransformersEmbeddingProvider();
		let promise = await provider.embed(["test"]);

		console.log(promise);
	});
});
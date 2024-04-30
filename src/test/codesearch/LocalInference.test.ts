import { LocalEmbeddingProvider } from "../../code-search/embedding/LocalEmbeddingProvider";

describe('LocalInference', () => {
	it.skip('should encoding', async () => {
		let localInference = new LocalEmbeddingProvider();
		await localInference.init();
		let promise = await localInference.embed("test");
		console.log(promise);
	});
});
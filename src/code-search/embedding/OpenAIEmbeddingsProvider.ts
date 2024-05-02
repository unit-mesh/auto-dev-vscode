import AuthedEmbeddingsProvider, { AuthedEmbedOptions } from "./_base/AuthedEmbeddingsProvider";

export class OpenAIEmbeddingsProvider extends AuthedEmbeddingsProvider {
// https://platform.openai.com/docs/api-reference/embeddings/create is 2048
	// but Voyage is 128
	static maxBatchSize = 128;

	static defaultOptions: Partial<AuthedEmbedOptions> | undefined = {
		apiBase: "https://api.openai.com/v1/",
		model: "text-embedding-3-small",
	};

	get id(): string {
		return this.options.model ?? "openai";
	}

	async embed(chunks: string[]) {
		if (!this.options.apiBase?.endsWith("/")) {
			this.options.apiBase += "/";
		}

		const batchedChunks = [];
		for (
			let i = 0;
			i < chunks.length;
			i += OpenAIEmbeddingsProvider.maxBatchSize
		) {
			batchedChunks.push(
				chunks.slice(i, i + OpenAIEmbeddingsProvider.maxBatchSize),
			);
		}
		return (
			await Promise.all(
				batchedChunks.map(async (batch) => {
					const fetchWithBackoff = () =>
						withExponentialBackoff<Response>(() =>
							fetch(new URL("embeddings", this.options.apiBase), {
								method: "POST",
								body: JSON.stringify({
									input: batch,
									model: this.options.model,
								}),
								headers: {
									Authorization: `Bearer ${this.options.apiKey}`,
									"Content-Type": "application/json",
								},
							}),
						);
					const resp = await fetchWithBackoff();

					if (!resp.ok) {
						throw new Error(await resp.text());
					}

					const data = (await resp.json()) as any;
					return data.data.map(
						(result: { embedding: number[] }) => result.embedding,
					);
				}),
			)
		).flat();
	}
}

const withExponentialBackoff = async <T>(
	apiCall: () => Promise<T>,
	maxRetries = 5,
	initialDelaySeconds = 1
) => {
	for (let attempt = 0; attempt < maxRetries; attempt++) {
		try {
			const result = await apiCall();
			return result;
		} catch (error: any) {
			if (
				(error as APIError).response?.status === 429 &&
				attempt < maxRetries - 1
			) {
				const delay = initialDelaySeconds * 2 ** attempt;
				console.log(
					`Hit rate limit. Retrying in ${delay} seconds (attempt ${
						attempt + 1
					})`
				);
				await new Promise((resolve) => setTimeout(resolve, delay * 1000));
			} else {
				throw error; // Re-throw other errors
			}
		}
	}
	throw new Error("Failed to make API call after multiple retries");
};

interface APIError extends Error {
	response?: Response;
}

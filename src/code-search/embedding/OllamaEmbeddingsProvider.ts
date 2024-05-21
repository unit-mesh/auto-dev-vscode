import AuthedEmbeddingsProvider, { AuthedEmbedOptions, FetchFunction } from "./_base/AuthedEmbeddingsProvider";
import { withExponentialBackoff } from "./utils/withExponentialBackoff";

async function embedOne(
	chunk: string,
	options: AuthedEmbedOptions,
	customFetch: FetchFunction,
) {
	const fetchWithBackoff = () =>
		withExponentialBackoff<Response>(() =>
			customFetch(new URL("api/embeddings", options.apiBase), {
				method: "POST",
				body: JSON.stringify({
					model: options.model,
					prompt: chunk,
				}),
			}),
		);
	const resp = await fetchWithBackoff();
	if (!resp.ok) {
		throw new Error("Failed to embed chunk: " + (await resp.text()));
	}

	return (await resp.json()).embedding;
}

export class OllamaEmbeddingsProvider extends AuthedEmbeddingsProvider {
	static defaultOptions: Partial<AuthedEmbedOptions> | undefined = {
		apiBase: "http://localhost:11434/",
	};

	get id(): string {
		return this.options.model ?? "ollama";
	}

	async embed(chunks: string[]) {
		const results: any = [];
		for (const chunk of chunks) {
			results.push(await embedOne(chunk, this.options, this.fetch));
		}
		return results;
	}
}

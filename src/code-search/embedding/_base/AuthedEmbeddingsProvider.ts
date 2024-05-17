import { EmbeddingsProvider } from "./EmbeddingsProvider";
import { Embedding } from "./Embedding";

export interface AuthedEmbedOptions {
	apiBase?: string;
	apiKey?: string;
	model?: string;
	requestOptions?: RequestOptions;
}

export interface RequestOptions {
	timeout?: number;
	verifySsl?: boolean;
	caBundlePath?: string | string[];
	proxy?: string;
	headers?: { [key: string]: string };
	extraBodyProperties?: { [key: string]: any };
}

export type FetchFunction = (url: string | URL, init?: any) => Promise<any>;

export class AuthedEmbeddingsProvider implements EmbeddingsProvider {
	options: AuthedEmbedOptions;
	fetch: FetchFunction;
	static defaultOptions: Partial<AuthedEmbedOptions> | undefined = undefined;

	get id(): string {
		throw new Error("Method not implemented.");
	}

	constructor(options: AuthedEmbedOptions, fetch: FetchFunction) {
		this.options = {
			...(this.constructor as typeof AuthedEmbeddingsProvider).defaultOptions,
			...options,
		};

		this.fetch = fetch;
	}

	embed(chunks: string[]): Promise<Embedding[]> {
		throw new Error("Method not implemented.");
	}
}

export default AuthedEmbeddingsProvider;

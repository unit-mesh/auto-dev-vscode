import { ChatMessage } from "./ChatMessage";
import { CompletionOptions } from "vscode-languageclient";
import { streamSse } from "./stream";
import { RequestOptions } from "node:http";
import { LlmConfig } from "../settings/LlmConfig";

type RequestInfo = Request | string;

class OpenAI {
	engine?: string;
	apiKey?: string;
	apiBase?: string;
	apiType?: "openai" | "azure";
	apiVersion?: string;
	requestOptions?: RequestOptions;
	model?: string;

	constructor(llmConfig: LlmConfig) {
		this.apiKey = llmConfig.apiKey;
		this.apiBase = llmConfig.apiBase;
		this.apiType = "openai";
		this.model = llmConfig.model;
	}

	protected async* _streamChat(messages: ChatMessage[]): AsyncGenerator<ChatMessage> {
		let body = {
			...this._convertArgs({}, messages),
			stream: true,
		};
		// Empty messages cause an error in LM Studio
		body.messages = body.messages.map((m) => ({
			...m,
			content: m.content === "" ? " " : m.content,
		})) as any;
		const response = await this.fetch(this._getEndpoint("chat/completions"), {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${this.apiKey}`,
				"api-key": this.apiKey ?? "", // For Azure
			},
			body: JSON.stringify(body),
		});

		for await (const value of streamSse(response)) {
			if (value.choices?.[0]?.delta?.content) {
				yield value.choices[0].delta;
			}
		}
	}

	protected _convertArgs(options: any, messages: ChatMessage[]) {
		const finalOptions = {
			messages: messages,
			model: this.model,
			max_tokens: options.maxTokens,
			temperature: options.temperature,
			top_p: options.topP,
			frequency_penalty: options.frequencyPenalty,
			presence_penalty: options.presencePenalty,
			stop: options.stop,
		};

		return finalOptions;
	}

	private _getEndpoint(
		endpoint: "chat/completions" | "completions" | "models",
	) {
		if (this.apiType === "azure") {
			return new URL(
				`openai/deployments/${this.engine}/${endpoint}?api-version=${this.apiVersion}`,
				this.apiBase,
			);
		} else {
			if (!this.apiBase) {
				throw new Error(
					"No API base URL provided. Please set the 'apiBase' option in config.json",
				);
			}

			return new URL(endpoint, this.apiBase);
		}
	}

	_fetch?: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response> = undefined;

	protected fetch(
		url: RequestInfo | URL,
		init?: RequestInit,
	): Promise<Response> {
		if (this._fetch) {
			// Custom Node.js fetch
			return this._fetch(url, init);
		}

		// Most of the requestOptions aren't available in the browser
		const headers = new Headers(init?.headers);
		for (const [key, value] of Object.entries(
			this.requestOptions?.headers ?? {},
		)) {
			headers.append(key, value as string);
		}

		return fetch(url, {
			...init,
			headers,
		});
	}
}
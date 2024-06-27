/* eslint-disable @typescript-eslint/naming-convention */
import { type CancellationToken, type Progress } from 'vscode';

export const enum ChatMessageRole {
	System = 'system',
	User = 'user',
	Assistant = 'assistant',
}

export interface IChatMessage {
	role: 'system' | 'user' | 'assistant';
	content: string;
}

export interface IChatMessagePart {
	type: 'text' | 'imageUrl';
	text?: string;
	imageUrl?: { url: string };
}

export type IChatMessageContent = string | IChatMessagePart[];

export interface IChatResponseFragment {
	index: number;
	part: string;
}

export interface ILanguageModelProvider {
	readonly identifier: string;

	provideChatResponse(
		messages: IChatMessage[],
		options: { [name: string]: any },
		progress?: Progress<IChatResponseFragment>,
		token?: CancellationToken,
	): Promise<string>;

	provideCompletionResponse(
		prompt: string,
		options: { [name: string]: any },
		progress?: Progress<IChatResponseFragment>,
		token?: CancellationToken,
	): Promise<string>;

	provideEmbedDocuments(
		input: string[],
		options: { [name: string]: any },
		token?: CancellationToken,
	): Promise<number[][]>;

	provideEmbedQuery(input: string | string[], options: { [name: string]: any }, token?: CancellationToken): Promise<number[]>;
}

export class LlmMsg {
	static fromMap(msgs: { [key: string]: string }): ChatMessage[] {
		return Object.entries(msgs).map(([key, value]) => ({
			role: toChatRole(key),
			content: value,
			name: null
		}));
	}
}

export interface ChatMessage {
	role: ChatRole;
	content: string;
	name?: string | null;
}

export enum FinishReason {
	Stopped = "stop",
	ContentFiltered = "content_filter",
	FunctionCall = "function_call",
	TokenLimitReached = "length"
}

export enum ChatRole {
	System = "system",
	User = "user",
	Assistant = "assistant",
	Function = "function"
}

export function toChatRole(key: string): ChatRole {
	switch (key) {
		case "system":
			return ChatRole.System;
		case "user":
			return ChatRole.User;
		case "assistant":
			return ChatRole.Assistant;
		case "function":
			return ChatRole.Function;
		default:
			throw new Error(`Unknown chat role: ${key}`);
	}
}

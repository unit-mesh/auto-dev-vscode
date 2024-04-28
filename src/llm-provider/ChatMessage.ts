export interface MessagePart {
	type: "text" | "imageUrl";
	text?: string;
	imageUrl?: { url: string };
}

export type MessageContent = string | MessagePart[];

export interface ChatMessage {
	role: ChatRole;
	content: string;
	name?: string | null;
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

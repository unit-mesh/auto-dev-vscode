import { CodeElement } from "../editor/codemodel/CodeFile";

export interface ChatContextItem {
	clazz: string;
	text: string;
}

export interface ChatCreationContext {
	origin: string;
	action: string;
	language: string;
	element: CodeElement;
	extraItems?: ChatContextItem[];
}

export abstract class ChatContextProvider {
	static name = "ChatContextProvider";

	isApplicable(context: ChatCreationContext): boolean {
		throw new Error("Method not implemented.");
	}

	async collect(context: ChatCreationContext): Promise<ChatContextItem[]> {
		throw new Error("Method not implemented.");
	}
}

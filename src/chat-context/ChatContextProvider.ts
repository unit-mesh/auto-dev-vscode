import { CodeElement } from "../editor/codemodel/CodeFile";

export interface ChatContextItem {
	clazz: string;
	text: string;
}

export interface ChatCreationContext {
	origin: string;
	action: string;
	sourceFile: any;
	extraItems: ChatContextItem[];
	element: CodeElement;
}

export class ChatContextProvider {
	isApplicable(): boolean {
		throw new Error("Method not implemented.");
	}

	async collect(): Promise<ChatContextItem[]> {
		throw new Error("Method not implemented.");
	}
}

async function collectChatContextList() {
	const chatContextList = [];
	chatContextList.push(new ChatContextProvider());
	return chatContextList;
}
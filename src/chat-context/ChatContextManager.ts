import { ChatContextProvider } from "./ChatContextProvider";

export class ChatContextManager {
	async collectChatContextList() {
		const chatContextList = [];
		chatContextList.push(new ChatContextProvider());
		return chatContextList;
	}
}

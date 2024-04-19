import { ChatContextItem, ChatContextProvider, ChatCreationContext } from "./ChatContextProvider";
import { providerContainer } from "../ProviderContainer.config";
import { PROVIDER_TYPES } from "../ProviderTypes";

export class ChatContextManager {
	private static instance_: ChatContextManager;

	private constructor() {
	}

	static instance(): ChatContextManager {
		if (!ChatContextManager.instance_) {
			ChatContextManager.instance_ = new ChatContextManager();
		}
		return ChatContextManager.instance_;
	}

	async collectChatContextList(context: ChatCreationContext): Promise<ChatContextItem[]> {
		let map: Promise<ChatContextItem[]>[] = providerContainer.getAll<ChatContextProvider>(PROVIDER_TYPES.ChatContextProvider).filter(async (provider) => {
			return provider.isApplicable(context);
		}).map(async (provider) => {
			return (await provider.collect(context)).flat();
		});

		return Promise.all(map).then((values) => {
			return values.flat();
		});
	}
}

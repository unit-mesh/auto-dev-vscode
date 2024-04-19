import { ChatContextProvider } from "./ChatContextProvider";
import { providerContainer } from "../ProviderContainer.config";
import { PROVIDER_TYPES } from "../ProviderTypes";

export class ChatContextManager {
	async collectChatContextList() {
		providerContainer.getAll<ChatContextProvider>(PROVIDER_TYPES.ChatContextProvider).map(async (provider) => {
			if (provider.isApplicable()) {
				return await provider.collect();
			}
		});
	}
}

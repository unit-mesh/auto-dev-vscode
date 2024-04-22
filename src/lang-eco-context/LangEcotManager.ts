import { LangEcoContextItem, LangEcoContextProvider, LangEcoCreationContext } from "./LangEcoContextProvider";
import { providerContainer } from "../ProviderContainer.config";
import { PROVIDER_TYPES } from "../ProviderTypes";

export class LangEcotManager {
	private static instance_: LangEcotManager;

	private constructor() {
	}

	static instance(): LangEcotManager {
		if (!LangEcotManager.instance_) {
			LangEcotManager.instance_ = new LangEcotManager();
		}
		return LangEcotManager.instance_;
	}

	async collectChatContextList(context: LangEcoCreationContext): Promise<LangEcoContextItem[]> {
		let map: Promise<LangEcoContextItem[]>[] = providerContainer.getAll<LangEcoContextProvider>(PROVIDER_TYPES.ChatContextProvider).filter(async (provider) => {
			return await provider.isApplicable(context);
		}).map(async (provider) => {
			return (await provider.collect(context)).flat();
		});

		return Promise.all(map).then((values) => {
			return values.flat();
		});
	}
}

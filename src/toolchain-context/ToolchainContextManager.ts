import { ToolchainContextItem, ToolchainContextProvider, CreateToolchainContext } from "./ToolchainContextProvider";
import { providerContainer } from "../ProviderContainer.config";
import { PROVIDER_TYPES } from "../ProviderTypes";

export class ToolchainContextManager {
	private static instance_: ToolchainContextManager;

	private constructor() {
	}

	static instance(): ToolchainContextManager {
		if (!ToolchainContextManager.instance_) {
			ToolchainContextManager.instance_ = new ToolchainContextManager();
		}
		return ToolchainContextManager.instance_;
	}

	async collectContextItems(context: CreateToolchainContext): Promise<ToolchainContextItem[]> {
		let map: Promise<ToolchainContextItem[]>[] = providerContainer.getAll<ToolchainContextProvider>(PROVIDER_TYPES.ChatContextProvider).filter(async (provider) => {
			return await provider.isApplicable(context);
		}).map(async (provider) => {
			return (await provider.collect(context)).flat();
		});

		return Promise.all(map).then((values) => {
			return values.flat();
		});
	}
}

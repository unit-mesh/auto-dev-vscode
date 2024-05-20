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
		let map: Promise<ToolchainContextItem[]>[] = providerContainer.getAll<ToolchainContextProvider>(PROVIDER_TYPES.ToolchainContextProvider)
			.map(async (provider) => {
				try {
					if (await provider?.isApplicable(context)) {
						return await provider?.collect(context);
					} else {
						return [];
					}
				} catch (e) {
					console.error("Error collecting context items", e);
					return [];
				}
			});

		try {
			let results = await Promise.all(map);
			return results.reduce((acc, val) => acc.concat(val), []);
		} catch (e) {
			console.error("Error collecting context items", e);
			return [];
		}
	}
}

import { ToolchainContextItem, CreateToolchainContext } from "./ToolchainContextProvider";
import { providerContainer } from "../ProviderContainer.config";
import { IToolchainContextProvider } from "src/ProviderTypes";

export class ToolchainContextManager {
	async collectContextItems(context: CreateToolchainContext): Promise<ToolchainContextItem[]> {
		let map: Promise<ToolchainContextItem[]>[] = providerContainer.getAll(IToolchainContextProvider)
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

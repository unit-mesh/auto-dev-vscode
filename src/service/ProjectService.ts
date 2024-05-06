import { Service } from "./Service";
import { providerContainer } from "../ProviderContainer.config";
import { PROVIDER_TYPES } from "../ProviderTypes";

export class ProjectService {
	static get<T extends Service>(): T | undefined {
		return providerContainer.get<T>(PROVIDER_TYPES.ProjectService);
	}
}

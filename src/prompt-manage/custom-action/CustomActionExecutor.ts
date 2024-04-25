import { CustomActionContext } from "./CustomActionContext";

export class CustomActionExecutor {
	public async execute(context: CustomActionContext): Promise<string> {
		return Promise.reject("Not implemented");
	}
}
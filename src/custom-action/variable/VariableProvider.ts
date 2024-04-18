import { ActionVariable } from "./ActionVariable";

export class VariableProvider {
	type: ActionVariable = new ActionVariable("DEFAULT", "DEFAULT");

	async resolve(): Promise<string> {
		return Promise.reject("Not implemented");
	}

	variableName(): string {
		return this.type.name;
	}
}
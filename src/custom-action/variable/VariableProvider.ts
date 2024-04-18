import { ActionVariable } from "./ActionVariable";

export abstract class VariableProvider {
	abstract get type(): ActionVariable;

	async resolve(): Promise<string> {
		return Promise.reject("Not implemented");
	}

	public variableName(): string {
		return this.type!!.name;
	}
}
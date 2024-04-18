import { ActionVariable } from "../ActionVariable";
import { VariableProvider } from "../VariableProvider";
import { BuiltinVariableMap, BuiltinVariables } from "./BuiltinVariable";

export class FrameworkVariableProvider implements VariableProvider {
	get type(): ActionVariable {
		return BuiltinVariableMap.get(BuiltinVariables.FRAMEWORK_CONTEXT)!!;
	}

	public variableName() {
		return this.type.name;
	}

	async resolve(): Promise<string> {
		throw new Error("Method not implemented.");
	}
}
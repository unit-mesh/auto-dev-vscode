import { BuiltinVariableMap, BuiltinVariables } from "./builtin/BuiltinVariable";
import { FrameworkVariableProvider } from "./builtin/FrameworkVariableProvider";

export class VariableResolver {

	async resolveBuiltinVariables() {
		BuiltinVariableMap.forEach(async (clz, variable) => {
			switch (variable) {
				case BuiltinVariables.SELECTION:
					break;
				case BuiltinVariables.BEFORE_CURSOR:
					break;
				case BuiltinVariables.AFTER_CURSOR:
					break;
				case BuiltinVariables.FILE_NAME:
					break;
				case BuiltinVariables.FILE_PATH:
					break;
				case BuiltinVariables.METHOD_NAME:
					break;
				case BuiltinVariables.LANGUAGE:
					break;
				case BuiltinVariables.COMMENT_SYMBOL:
					break;
				case BuiltinVariables.FRAMEWORK_CONTEXT:
					let promise = await new FrameworkVariableProvider().resolve();
					break;
			}
		});
	}
}
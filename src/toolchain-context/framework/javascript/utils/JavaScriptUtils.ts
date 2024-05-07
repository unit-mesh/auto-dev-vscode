import { CreateToolchainContext } from "../../../ToolchainContextProvider";

export function applyJavaScript(context: CreateToolchainContext) {
	return context.language === "javascript" || context.language === "typescript" || context.language === "javascriptreact" || context.language === "typescriptreact";
}

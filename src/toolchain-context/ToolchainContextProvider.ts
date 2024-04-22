import { NamedElementBlock } from "../editor/document/NamedElementBlock";
import { ScopeGraph } from "../code-search/ScopeGraph";

export interface ToolchainContextItem {
	/// for recording and debugging
	clazz: string;
	text: string;
}

export interface CreateToolchainContext {
	action: string;
	language: string;
	filename: string;
	content: string;
	block: NamedElementBlock;
	graph?: ScopeGraph;
	extraItems?: ToolchainContextItem[];
}

export interface ToolchainContextProvider {
	isApplicable(context: CreateToolchainContext): Promise<boolean>

	collect(context: CreateToolchainContext): Promise<ToolchainContextItem[]>
}

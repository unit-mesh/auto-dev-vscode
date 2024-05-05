import { NamedElement } from "../editor/ast/NamedElement";
import { ScopeGraph } from "../code-search/scope-graph/ScopeGraph";

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
	element: NamedElement;
	graph?: ScopeGraph;
	extraItems?: ToolchainContextItem[];
}

export interface ToolchainContextProvider {
	isApplicable(context: CreateToolchainContext): Promise<boolean>

	collect(context: CreateToolchainContext): Promise<ToolchainContextItem[]>
}

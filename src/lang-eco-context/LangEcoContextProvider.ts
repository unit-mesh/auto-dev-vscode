import { NamedElementBlock } from "../editor/document/NamedElementBlock";
import { ScopeGraph } from "../code-search/ScopeGraph";

export interface LangEcoContextItem {
	/// for recording and debugging
	clazz: string;
	text: string;
}

export interface LangEcoCreationContext {
	action: string;
	language: string;
	filename: string;
	content: string;
	block: NamedElementBlock;
	graph?: ScopeGraph;
	extraItems?: LangEcoContextItem[];
}

export interface LangEcoContextProvider {
	isApplicable(context: LangEcoCreationContext): Promise<boolean>

	collect(context: LangEcoCreationContext): Promise<LangEcoContextItem[]>
}

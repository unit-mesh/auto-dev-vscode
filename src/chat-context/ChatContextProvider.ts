import { CodeElement } from "../editor/codemodel/CodeFile";
import { NamedElementBlock } from "../editor/document/NamedElementBlock";

export interface ChatContextItem {
	clazz: string;
	text: string;
}

export interface ChatCreationContext {
	action: string;
	language: string;
	filename: string;
	content: string;
	block: NamedElementBlock;
	element?: CodeElement;
	extraItems?: ChatContextItem[];
}

export interface ChatContextProvider {
	isApplicable(context: ChatCreationContext): Promise<boolean>

	collect(context: ChatCreationContext): Promise<ChatContextItem[]>
}

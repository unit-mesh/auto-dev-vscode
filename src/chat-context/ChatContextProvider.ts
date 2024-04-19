import { CodeElement } from "../editor/codemodel/CodeFile";
import { injectable } from "inversify";

export interface ChatContextItem {
	clazz: string;
	text: string;
}

export interface ChatCreationContext {
	action: string;
	language: string;
	filename: string;
	element?: CodeElement;
	extraItems?: ChatContextItem[];
}

export interface ChatContextProvider {
	isApplicable(context: ChatCreationContext): Promise<boolean>

	collect(context: ChatCreationContext): Promise<ChatContextItem[]>
}

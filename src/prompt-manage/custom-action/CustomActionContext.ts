import { TemplateContext } from "../template/TemplateContext";
import { NamedElement } from "../../editor/ast/NamedElement";

export interface CustomActionContext extends TemplateContext {
	filepath: string,
	element: NamedElement,
	beforeCursor: string,
	afterCursor: string,
	selectedText: string,
}
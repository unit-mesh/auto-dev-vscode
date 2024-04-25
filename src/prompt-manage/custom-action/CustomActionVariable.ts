import { TemplateContext } from "../template/TemplateContext";
import { NamedElement } from "../../editor/ast/NamedElement";

export interface CustomActionVariable extends TemplateContext {
	filepath: string,
	element: NamedElement,
	beforeCursor: string,
	afterCursor: string,
	selection: string,
	input?: string
	output?: string,
	spec?: string,
	similarChunk?: string,
}

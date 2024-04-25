import { TemplateContext } from "../template/TemplateContext";
import { NamedElement } from "../../editor/ast/NamedElement";

export interface CustomActionTemplateContext extends TemplateContext {
	filepath: string,
	element: NamedElement,
	beforeCursor: string,
	afterCursor: string,
	selection: string,
	commentSymbol: string,
	input?: string
	output?: string,
	spec?: string,
	similarChunk?: string,
}

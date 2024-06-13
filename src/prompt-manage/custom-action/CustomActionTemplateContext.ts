import { NamedElement } from '../../editor/ast/NamedElement';
import { TemplateContext } from '../template/TemplateContext';

export interface CustomActionTemplateContext extends TemplateContext {
	filepath: string;
	element: NamedElement;
	beforeCursor: string;
	afterCursor: string;
	selection: string;
	commentSymbol: string;
	toolchainContext: string;
	input?: string;
	output?: string;
	spec?: string;
	similarChunk?: string;
}

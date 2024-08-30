import { TemplateContext } from '../../prompt-manage/template/TemplateContext';

export interface AutoMethodTemplateContext extends TemplateContext {
	startSymbol: string;
	endSymbol: string;
	code: string;
	forbiddenRules: string[];
	originalMethodCodes: string[];
	customFrameworkCodeFileContext?:string;
}

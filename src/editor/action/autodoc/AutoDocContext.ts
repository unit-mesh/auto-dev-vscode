import { TemplateContext } from "../../../prompt-manage/template/TemplateContext";

export interface AutoDocContext extends TemplateContext {
	language: string;
	startSymbol: string;
	endSymbol: string;
	code: string;
	forbiddenRules: string[];
}
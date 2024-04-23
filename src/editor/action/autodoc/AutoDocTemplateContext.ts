import { TemplateContext } from "../../../prompt-manage/template/TemplateContext";

export interface AutoDocTemplateContext extends TemplateContext {
	language: string;
	startSymbol: string;
	endSymbol: string;
	code: string;
	forbiddenRules: string[];
	originalComments: string[];
}
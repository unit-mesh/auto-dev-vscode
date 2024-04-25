import { TemplateContext } from "../../../prompt-manage/template/TemplateContext";

export interface AutoDocTemplateContext extends TemplateContext {
	startSymbol: string;
	endSymbol: string;
	code: string;
	forbiddenRules: string[];
	originalComments: string[];
}
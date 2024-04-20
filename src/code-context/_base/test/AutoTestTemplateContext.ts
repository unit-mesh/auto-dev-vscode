import { CodeStructure } from "../../../editor/codemodel/CodeFile";
import { TemplateContext } from "../../../prompt-manage/template/TemplateContext";

export interface AutoTestTemplateContext extends TemplateContext {
	isNewFile?: boolean,
	relatedClasses: CodeStructure[],
	testClassName: string,
	language: string,
	currentClass?: CodeStructure,
	imports?: string[],
	targetPath?: string,
	sourceCode?: string,
}
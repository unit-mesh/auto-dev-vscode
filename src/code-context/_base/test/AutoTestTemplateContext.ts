import { CodeStructure } from "../../../editor/codemodel/CodeElement";
import { TemplateContext } from "../../../prompt-manage/template/TemplateContext";
import { ToolchainContextItem } from "../../../toolchain-context/ToolchainContextProvider";

export interface AutoTestTemplateContext extends TemplateContext {
	filename: string,
	isNewFile?: boolean,
	relatedClasses: string,
	testClassName: string,
	currentClass?: CodeStructure,
	imports?: string[],
	targetPath?: string,
	sourceCode?: string,
	extraItems?: ToolchainContextItem[]
}
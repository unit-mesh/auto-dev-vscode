import { CodeStructure } from "../../../editor/codemodel/CodeFile";
import { TemplateContext } from "../../../prompt-manage/template/TemplateContext";
import { ToolchainContextItem } from "../../../toolchain-context/ToolchainContextProvider";

export interface AutoTestTemplateContext extends TemplateContext {
	filename: string,
	isNewFile?: boolean,
	relatedClasses: CodeStructure[],
	testClassName: string,
	currentClass?: CodeStructure,
	imports?: string[],
	targetPath?: string,
	sourceCode?: string,
	extraItems?: ToolchainContextItem[]
}
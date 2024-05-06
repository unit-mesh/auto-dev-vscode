import { CodeStructure } from "../../../editor/codemodel/CodeElement";
import { TemplateContext } from "../../../prompt-manage/template/TemplateContext";
import { ToolchainContextItem } from "../../../toolchain-context/ToolchainContextProvider";

export interface AutoTestTemplateContext extends TemplateContext {
	filename: string,
	isNewFile?: boolean,
	relatedClasses: string,
	/// means the class which you want to test
	currentClass?: CodeStructure,
	underTestClassName: string,
	/// the generated test class name
	genTestClassName?: string,
	targetPath?: string,
	imports?: string[],
	sourceCode?: string,
	extraItems?: ToolchainContextItem[]
}
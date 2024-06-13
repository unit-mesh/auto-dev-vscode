import { TemplateContext } from '../../../prompt-manage/template/TemplateContext';
import { ToolchainContextItem } from '../../../toolchain-context/ToolchainContextProvider';

export interface AutoTestTemplateContext extends TemplateContext {
	filename: string;
	isNewFile?: boolean;
	relatedClasses: string;
	/// means the class which you want to test
	currentClass?: string;
	underTestClassName: string;
	/// the generated test class name
	targetTestClassName?: string;
	targetPath?: string;
	imports?: string[];
	sourceCode?: string;
	extraItems?: ToolchainContextItem[];
}

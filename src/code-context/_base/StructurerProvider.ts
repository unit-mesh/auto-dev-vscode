import { CodeFile } from "../../editor/codemodel/CodeFile";
import { SupportedLanguage } from "../../editor/language/SupportedLanguage";

export interface StructurerProvider {
	isApplicable(lang: SupportedLanguage): any;

	parseFile(code: string, path: string): Promise<CodeFile | undefined>
}


import { CodeFile, CodeStructure } from "../../../editor/codemodel/CodeFile";
import { TestGenContext } from "./TestGenContext";
import { TSLanguageService } from "../../../editor/language/service/TSLanguageService";
import { SupportedLanguage } from "../../../editor/language/SupportedLanguage";
import { Uri } from "vscode";

export interface TestGenProvider {
	isApplicable(lang: SupportedLanguage): boolean;
	setup(defaultLanguageService: TSLanguageService, context?: TestGenContext): Promise<void>;
	findOrCreateTestFile(sourceFile: Uri, element: any): Promise<TestGenContext>;
	lookupRelevantClass(element: any): Promise<CodeStructure>;
}
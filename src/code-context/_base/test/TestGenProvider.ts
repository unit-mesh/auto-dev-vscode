import vscode from "vscode";

import { CodeStructure } from "../../../editor/codemodel/CodeFile";
import { TestGenContext } from "./TestGenContext";
import { TSLanguageService } from "../../../editor/language/service/TSLanguageService";
import { SupportedLanguage } from "../../../editor/language/SupportedLanguage";

export interface TestGenProvider {
	isApplicable(lang: SupportedLanguage): boolean;
	setup(defaultLanguageService: TSLanguageService, context?: TestGenContext): Promise<void>;
	findOrCreateTestFile(sourceFile: vscode.TextDocument, element: any): Promise<TestGenContext>;
	lookupRelevantClass(element: any): Promise<CodeStructure>;
}
import vscode from "vscode";

import { CodeFile } from "../../../editor/codemodel/CodeFile";
import { AutoTestTemplateContext } from "./AutoTestTemplateContext";
import { TSLanguageService } from "../../../editor/language/service/TSLanguageService";
import { SupportedLanguage } from "../../../editor/language/SupportedLanguage";
import { NamedElement } from "../../../editor/ast/NamedElement";

export interface TestGenProvider {
	isApplicable(lang: SupportedLanguage): boolean;
	setupContext(defaultLanguageService: TSLanguageService, context?: AutoTestTemplateContext): Promise<void>;
	setupTestFile(sourceFile: vscode.TextDocument, element: NamedElement): Promise<AutoTestTemplateContext>;
	lookupRelevantClass(element: NamedElement): Promise<CodeFile[]>;
}
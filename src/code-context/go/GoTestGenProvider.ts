import { injectable } from "inversify";
import { TextDocument } from "vscode";

import { NamedElement } from "../../editor/ast/NamedElement";
import { CodeStructure } from "../../editor/codemodel/CodeFile";
import { TSLanguageService } from "../../editor/language/service/TSLanguageService";
import { AutoTestTemplateContext } from "../_base/test/AutoTestTemplateContext";
import { TestGenProvider } from "../_base/test/TestGenProvider";

@injectable()
export class GoTestGenProvider implements TestGenProvider {
	private languageService: TSLanguageService | undefined;

	isApplicable(lang: string): boolean {
		return lang === "go";
	}

	setup(defaultLanguageService: TSLanguageService, context?: AutoTestTemplateContext | undefined): Promise<void> {
		this.languageService = defaultLanguageService;

		return Promise.resolve();
	}

	findOrCreateTestFile(sourceFile: TextDocument, element: NamedElement): Promise<AutoTestTemplateContext> {
		throw new Error("Method not implemented.");
	}

	lookupRelevantClass(element: any): Promise<CodeStructure> {
		throw new Error("Method not implemented.");
	}
}

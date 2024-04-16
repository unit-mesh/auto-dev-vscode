import { TestGenContext, TestGenProvider } from "../_base/TestGenProvider";
import { CodeFile, CodeStructure } from "../../editor/codemodel/CodeFile";
import { TSLanguageService } from "../../editor/language/service/TSLanguageService";

export class JavaTestGenProvider implements TestGenProvider {
	private context: TestGenContext | undefined;
	private languageService: TSLanguageService | undefined;

	constructor(context?: TestGenContext) {
		this.context = context;
	}

	async init(defaultLanguageService: TSLanguageService) {
		this.languageService = defaultLanguageService;
	}

	findOrCreateTestFile(sourceFile: CodeFile, element: any): Promise<TestGenContext> {
		return Promise.resolve(this.context!!);
	}

	lookupRelevantClass(element: any): Promise<CodeStructure> {
		throw new Error("Method not implemented.");
	}
}
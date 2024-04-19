import { TestGenProvider } from "../_base/test/TestGenProvider";
import { CodeFile, CodeStructure } from "../../editor/codemodel/CodeFile";
import { TSLanguageService } from "../../editor/language/service/TSLanguageService";
import { TestGenContext } from "../_base/test/TestGenContext";
import { injectable } from "inversify";

@injectable()
export class JavaTestGenProvider implements TestGenProvider {
	private context: TestGenContext | undefined;
	private languageService: TSLanguageService | undefined;

	constructor() {

	}

	async setup(defaultLanguageService: TSLanguageService, context?: TestGenContext) {
		this.languageService = defaultLanguageService;
		this.context = context;
	}

	findOrCreateTestFile(sourceFile: CodeFile, element: any): Promise<TestGenContext> {
		return Promise.resolve(this.context!!);
	}

	lookupRelevantClass(element: any): Promise<CodeStructure> {
		throw new Error("Method not implemented.");
	}
}
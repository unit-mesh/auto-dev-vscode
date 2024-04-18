import { CodeFile, CodeStructure } from "../../editor/codemodel/CodeFile";

export interface TestGenContext {
	isNewFile?: boolean,
	relatedClasses: CodeStructure[],
	testClassName: string,
	language: string,
	currentObject: CodeStructure,
}

export interface TestGenProvider {
	findOrCreateTestFile(sourceFile: CodeFile, element: any): Promise<TestGenContext>;
	lookupRelevantClass(element: any): Promise<CodeStructure>;
}
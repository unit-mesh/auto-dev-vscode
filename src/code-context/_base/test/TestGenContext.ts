import { CodeStructure } from "../../../editor/codemodel/CodeFile";

export interface TestGenContext {
	isNewFile?: boolean,
	relatedClasses: CodeStructure[],
	testClassName: string,
	language: string,
	currentObject: CodeStructure,
}
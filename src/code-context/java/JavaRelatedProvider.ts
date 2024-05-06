import { injectable } from "inversify";

import { RelatedCodeProvider } from "../_base/RelatedCodeProvider";
import { CodeFile, CodeFunction, CodeStructure } from "../../editor/codemodel/CodeFile";

@injectable()
export class JavaRelatedProvider implements RelatedCodeProvider {
	name = "JavaRelatedProvider";
	language = "java";

	inputAndOutput(file: CodeFile, method: CodeFunction): Promise<CodeStructure[]> {
		return Promise.resolve([]);
	}
}

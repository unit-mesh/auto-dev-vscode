import { RelatedProvider } from "./RelatedProvider";
import { CodeFile } from "../../codemodel/CodeFile";

export class JavaRelatedProvider implements RelatedProvider {
	file: CodeFile;

	constructor(file: CodeFile) {
		this.file = file;
	}

	fanIn(canonicalName: string): string[] {
		return [];
	}

	fanOut(canonicalName: string): string[] {
		return [];
	}
}
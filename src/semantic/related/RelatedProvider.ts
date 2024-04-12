import { CodeFile } from "../../codemodel/CodeFile";

export interface RelatedProvider {
	file: CodeFile;

	/**
	 * Returns the fan-in of the given node.
	 */
	fanIn(canonicalName: string): string[];

	/**
	 * Returns the fan-out of the given node.
	 */
	fanOut(canonicalName: string): string[];
}

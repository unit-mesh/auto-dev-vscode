import { CodeFile } from "../../codemodel/CodeFile";

export interface RelatedProvider {
	file: CodeFile;

	/**
	 * Returns the fan-in of the given node.
	 */
	fanIn(symbol: string): CodeFile[];

	/**
	 * Returns the fan-out of the given node.
	 */
	fanOut(symbol: string): CodeFile[];
}

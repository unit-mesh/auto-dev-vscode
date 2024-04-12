import { CodeFile } from "../../codemodel/CodeFile";

export interface RelatedProvider {
	file: CodeFile;

	/**
	 * Returns the fan-in of the given symbol.
	 * For example, In java in
	 */
	inputParameters(symbol: string): CodeFile[];

	/**
	 * Returns the fan-out of the given node.
	 *
	 * In some languages, the return type is multiple.
	 */
	outputTypes(symbol: string): CodeFile[];
}

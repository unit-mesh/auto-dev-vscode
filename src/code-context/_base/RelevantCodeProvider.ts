import { CodeFile } from "../../editor/codemodel/CodeElement";
import { SupportedLanguage } from "../../editor/language/SupportedLanguage";
import { TreeSitterFile } from "../ast/TreeSitterFile";
import { NamedElement } from "../../editor/ast/NamedElement";
import { TSLanguageService } from "../../editor/language/service/TSLanguageService";

/**
 * The `RelatedProvider` class provides methods for retrieving input and output structures related to a given symbol.
 *
 * An input structure is a code file that is used as input to the symbol, while an output structure is a code
 * file that receives output from the symbol.
 *
 * @interface RelevantCodeProvider
 */
export interface RelevantCodeProvider {
	language: SupportedLanguage;

	setupLanguage(defaultLanguageService: TSLanguageService): void;

	/**
	 * Returns the fan-in and fan-out of the given method.
	 * For example:
	 *
	 * ```java
	 * package com.example;
	 *
	 * public class CodeFile {
	 *  public CodeMethod getMethodById(String id) {
	 *    //...return a + b;
	 *  }
	 * }
	 * ```
	 *
	 * @param [file] will be current file, like: `com.example.CodeFile`
	 * @param [method] will be `com.example.CodeFile.getMethodById`
	 * @returns will be CodeMethod, since `getMethodById` does not have any input parameters,
	 * and the return type is `CodeMethod`.
	 */
	getMethodFanInAndFanOut(file: TreeSitterFile, method: NamedElement): Promise<CodeFile[]>;
}

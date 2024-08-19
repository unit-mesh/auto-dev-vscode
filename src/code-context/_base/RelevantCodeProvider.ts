import { LanguageIdentifier } from 'base/common/languages/languages';
import { ILanguageServiceProvider } from 'base/common/languages/languageService';

import { NamedElement } from '../../editor/ast/NamedElement';
import { CodeFile } from '../../editor/codemodel/CodeElement';
import { TreeSitterFile } from '../ast/TreeSitterFile';

/**
 * The `RelatedProvider` class provides methods for retrieving input and output structures related to a given symbol.
 *
 * An input structure is a code file that is used as input to the symbol, while an output structure is a code
 * file that receives output from the symbol.
 *
 * @interface RelevantCodeProvider
 */
/**
*“RelatedProvider”类提供了检索与给定符号相关的输入和输出结构的方法。
*
*输入结构是用作符号输入的代码文件，而输出结构是代码
*接收符号输出的文件。
*
*@interface 相关代码提供程序
**/

export interface RelevantCodeProvider {
	language: LanguageIdentifier;

	setupLanguage(defaultLanguageServiceProvider: ILanguageServiceProvider): void;

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

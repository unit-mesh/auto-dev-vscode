import vscode from 'vscode';

import { ILanguageServiceProvider } from 'base/common/languages/languageService';

import { NamedElement } from '../../../editor/ast/NamedElement';
import { ToolchainContextItem } from '../../../toolchain-context/ToolchainContextProvider';
import { AutoTestTemplateContext } from './AutoTestTemplateContext';
import { LanguageIdentifier } from 'base/common/languages/languages';

/**
 * `TestGenProvider` is an interface that provides methods for checking application language support, collecting context for test generation, setting up language services, creating test files, and looking up relevant classes for given elements.
 *
 * @interface TestGenProvider
 *
 * @method isApplicable(lang: SupportedLanguage): boolean
 * This method checks if the application supports a given language. It takes a `SupportedLanguage` type as an argument and returns a boolean value.
 *
 * @method collect(context: AutoTestTemplateContext): Promise<ToolchainContextItem[]>
 * This method collects the context for the test generation, like TestFramework, BuildTool, etc. It takes an `AutoTestTemplateContext` as an argument and returns a Promise that resolves with an array of `ToolchainContextItem`.
 *
 * @method setupLanguage(defaultLanguageServiceProvider: ILanguageServiceProvider, context?: AutoTestTemplateContext): Promise<void>
 * This method sets up the language service. It takes a `ILanguageServiceProvider` and an optional `AutoTestTemplateContext` as arguments and returns a Promise that resolves with void.
 *
 * @method setupTestFile(sourceFile: vscode.TextDocument, element: NamedElement): Promise<AutoTestTemplateContext>
 * This method creates a test file for the given source file and element, and initializes the context if not already done. It takes a `vscode.TextDocument` and a `NamedElement` as arguments and returns a Promise that resolves with an `AutoTestTemplateContext`.
 *
 * @method lookupRelevantClass(element: NamedElement): Promise<CodeFile[]>
 * This method looks up the relevant class for the given element. It takes a `NamedElement` as an argument and returns a Promise that resolves with an array of `CodeFile`.
 *
 */
export interface TestGenProvider {
	/**
	 * checks if the application supports a given language.
	 */
	isApplicable(lang: LanguageIdentifier): boolean;

	/**
	 * collects the context for the test generation, like TestFramework, BuildTool, etc.
	 */
	additionalTestContext(context: AutoTestTemplateContext): Promise<ToolchainContextItem[]>;

	/**
	 * setup for language service which is used for test generation.
	 */
	setupLanguage(defaultLanguageServiceProvider: ILanguageServiceProvider, context?: AutoTestTemplateContext): Promise<void>;

	/**
	 * Creates a test file for the given source file and element, and init context if not already done.
	 */
	setupTestFile(sourceFile: vscode.TextDocument, element: NamedElement): Promise<AutoTestTemplateContext>;

	/**
	 * after test file is created, try to fix the code, like imports and package and className, etc.
	 */
	postProcessCodeFix(document: vscode.TextDocument, output: string): Promise<void>;
}

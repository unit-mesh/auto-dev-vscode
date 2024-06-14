/* eslint-disable @typescript-eslint/naming-convention */
/**
 * The PROVIDER_TYPES object is a collection of string constants that represent different types of providers
 * in the system. Each property in the object corresponds to a specific provider type.
 */
import { type interfaces } from 'inversify';

import type { ActionCreator } from './action/_base/ActionCreator';
import type { LanguageProfile } from './code-context/_base/LanguageProfile';
import type { RelevantCodeProvider } from './code-context/_base/RelevantCodeProvider';
import { StructurerProvider } from './code-context/_base/StructurerProvider';
import { TestGenProvider } from './code-context/_base/test/TestGenProvider';
import { Service } from './service/Service';
import { BuildToolProvider } from './toolchain-context/buildtool/_base/BuildToolProvider';
import type { ToolchainContextProvider } from './toolchain-context/ToolchainContextProvider';

/** {@link ActionCreator#buildActions} is a provider to create VSCode action by Syntax node */
export const IActionCreator: interfaces.ServiceIdentifier<ActionCreator> = Symbol('ActionCreator');

/** {@link LanguageProfile} is a provider to get language specific information */
export const ILanguageProfile: interfaces.ServiceIdentifier<LanguageProfile> = Symbol('LanguageProfile');

/**
 * {@link ToolchainContextProvider#collect} is a provider to collect context for test generation
 */
export const IToolchainContextProvider: interfaces.ServiceIdentifier<ToolchainContextProvider> =
	Symbol('ToolchainContextProvider');

/**
 * {@link RelevantCodeProvider#getMethodFanInAndFanOut} is a provider to look up relevant code
 */
export const IRelevantCodeProvider: interfaces.ServiceIdentifier<RelevantCodeProvider> = Symbol('RelevantCodeProvider');

/**
 * {@link BuildToolProvider#getDependencies} is a provider to collect context for test generation
 */
export const IBuildToolProvider: interfaces.ServiceIdentifier<BuildToolProvider> = Symbol('BuildToolProvider');

/**
 * {@link TestGenProvider#setupTestFile} is a provider to generate test code
 */
export const ITestGenProvider: interfaces.ServiceIdentifier<TestGenProvider> = Symbol('TestGenProvider');

/**
 * Code structure analysis, parse source code to structure data
 * see in {@link StructurerProvider#parseFile}
 * structure data for {@link CodeElement} which can be {@link CodeFile}, {@link CodeFunction}, {@link CodeVariable}
 */
export const IStructurerProvider: interfaces.ServiceIdentifier<StructurerProvider> = Symbol('IStructurerProvider');

/**
 * {@link ProjectService} is a provider to get language specific information
 */
export const IProjectService: interfaces.ServiceIdentifier<Service> = Symbol('IProjectService');

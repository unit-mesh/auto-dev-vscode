import { providerContainer } from 'base/common/instantiation/instantiationService';

import { AutoDocActionCreator } from './action/autodoc/AutoDocActionCreator';
import { AutoTestActionCreator } from './action/autotest/AutoTestActionCreator';
import { GenApiDataActionCreator } from './action/test-data/GenApiDataActionCreator';
import { LanguageProfile } from './code-context/_base/LanguageProfile';
import { RelevantCodeProvider } from './code-context/_base/RelevantCodeProvider';
import { StructurerProvider } from './code-context/_base/StructurerProvider';
import { TestGenProvider } from './code-context/_base/test/TestGenProvider';
import { GoStructurerProvider } from './code-context/go/GoStructurerProvider';
import { JavaRelevantCodeProvider } from './code-context/java/JavaRelevantCodeProvider';
import { JavaStructurerProvider } from './code-context/java/JavaStructurerProvider';
import { JavaTestGenProvider } from './code-context/java/JavaTestGenProvider';
import { PythonTestGenProvider } from './code-context/python/PythonTestGenProvider';
import { TypeScriptStructurer } from './code-context/typescript/TypeScriptStructurer';
import { TypeScriptTestGenProvider } from './code-context/typescript/TypeScriptTestGenProvider';
import { TeamTermService } from './domain/TeamTermService';
import { languageContainer } from './ProviderLanguageProfile.config';
import {
	IActionCreator,
	IBuildToolProvider,
	ILanguageProfile,
	IProjectService,
	IRelevantCodeProvider,
	IStructurerProvider,
	ITestGenProvider,
	IToolchainContextProvider,
} from './ProviderTypes';
import { BuildToolProvider } from './toolchain-context/buildtool/_base/BuildToolProvider';
import { GoBuildToolProvider } from './toolchain-context/buildtool/GoBuildToolProvider';
import { GradleBuildToolProvider } from './toolchain-context/buildtool/GradleBuildToolProvider';
import { NpmBuildToolProvider } from './toolchain-context/buildtool/NpmBuildToolProvider';
import { JavaScriptContextProvider } from './toolchain-context/framework/javascript/JavaScriptContextProvider';
import { SpringContextProvider } from './toolchain-context/framework/jvm/SpringContextProvider';
import { ToolchainContextProvider } from './toolchain-context/ToolchainContextProvider';
import { JavaVersionProvider } from './toolchain-context/version/JavaVersionProvider';

// Action Register
providerContainer.bind(IActionCreator).to(AutoDocActionCreator);
providerContainer.bind(IActionCreator).to(AutoTestActionCreator);
providerContainer.bind(IActionCreator).to(GenApiDataActionCreator);

/**
 * The `LanguageProvider` interface in TypeScript is used to define the structure of a language provider.
 * A language provider is an object that provides various functionalities related to a specific programming language.
 */
export interface LanguageProvider {
	relatedCodeProvider?: RelevantCodeProvider;
	testGenProvider?: TestGenProvider;
	buildToolProvider?: BuildToolProvider;
	structurer?: StructurerProvider;
	toolchainContextProvider?: ToolchainContextProvider[];
}

providerContainer.bind(IToolchainContextProvider).to(SpringContextProvider);
providerContainer.bind(IToolchainContextProvider).to(JavaVersionProvider);

providerContainer.bind(IRelevantCodeProvider).to(JavaRelevantCodeProvider);
providerContainer.bind(ITestGenProvider).to(JavaTestGenProvider);
providerContainer.bind(IBuildToolProvider).to(GradleBuildToolProvider);
providerContainer.bind(IStructurerProvider).to(JavaStructurerProvider);

// TypeScript
providerContainer.bind(IToolchainContextProvider).to(JavaScriptContextProvider);
providerContainer.bind(IBuildToolProvider).to(NpmBuildToolProvider);
providerContainer.bind(ITestGenProvider).to(TypeScriptTestGenProvider);
providerContainer.bind(IStructurerProvider).to(TypeScriptStructurer);

// Golang
providerContainer.bind(IBuildToolProvider).to(GoBuildToolProvider);
providerContainer.bind(IStructurerProvider).to(GoStructurerProvider);

// Python
providerContainer.bind(ITestGenProvider).to(PythonTestGenProvider);

/**
 * TODO: improve the design for LanguageProfile
 * In current design, since the unit test slowly in VSCode env, we separate some design out vscode env,
 * So the {@link LanguageProfile} should manual register in {@link TSLanguageUtil}
 */
languageContainer.getAll(ILanguageProfile).forEach((profile: LanguageProfile) => {
	providerContainer.bind(ILanguageProfile).toConstantValue(profile);
});

providerContainer.bind(IProjectService).to(TeamTermService);

export { providerContainer };

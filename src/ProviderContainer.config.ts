import { Container } from "inversify";
import { PROVIDER_TYPES } from "./ProviderTypes";

import { ToolchainContextProvider } from "./toolchain-context/ToolchainContextProvider";
import { SpringContextProvider } from "./toolchain-context/framework/jvm/SpringContextProvider";
import { JavaSdkVersionProvider } from "./toolchain-context/sdk/JavaSdkVersionProvider";
import { JavaScriptContextProvider } from "./toolchain-context/framework/javascript/JavaScriptContextProvider";

import { RelevantCodeProvider } from "./code-context/_base/RelevantCodeProvider";
import { JavaRelevantCodeProvider } from "./code-context/java/JavaRelevantCodeProvider";
import { BuildToolProvider } from "./toolchain-context/buildtool/_base/BuildToolProvider";
import { NpmBuildToolProvider } from "./toolchain-context/buildtool/NpmBuildToolProvider";
import { GradleBuildToolProvider } from "./toolchain-context/buildtool/GradleBuildToolProvider";

import { JavaTestGenProvider } from "./code-context/java/JavaTestGenProvider";
import { TestGenProvider } from "./code-context/_base/test/TestGenProvider";
import { TypeScriptTestGenProvider } from "./code-context/typescript/TypeScriptTestGenProvider";
import { StructurerProvider } from "./code-context/_base/StructurerProvider";
import { JavaStructurerProvider } from "./code-context/java/JavaStructurerProvider";
import { TypeScriptStructurer } from "./code-context/typescript/TypeScriptStructurer";
import { ActionCreator } from "./editor/action/_base/ActionCreator";
import { AutoDocActionCreator } from "./editor/action/autodoc/AutoDocActionCreator";
import { AutoTestActionCreator } from "./editor/action/autotest/AutoTestActionCreator";
import { GenApiDataActionCreator } from "./editor/action/test-data/GenApiDataActionCreator";
import { GoBuildToolProvider } from "./toolchain-context/buildtool/GoBuildToolProvider";
import { GoStructurerProvider } from "./code-context/go/GoStructurerProvider";
import { LanguageProfile } from "./code-context/_base/LanguageProfile";
import { JavaProfile } from "./code-context/java/JavaProfile";
import { TypeScriptProfile } from "./code-context/typescript/TypeScriptProfile";
import { GolangProfile } from "./code-context/go/GolangProfile";
import { languageContainer } from "./ProviderLanguageProfile.config";

const providerContainer = new Container();

// Action Register
providerContainer.bind<ActionCreator>(PROVIDER_TYPES.ActionCreator).to(AutoDocActionCreator);
providerContainer.bind<ActionCreator>(PROVIDER_TYPES.ActionCreator).to(AutoTestActionCreator);
providerContainer.bind<ActionCreator>(PROVIDER_TYPES.ActionCreator).to(GenApiDataActionCreator);

/**
 * A Language need to have a:
 * - RelatedCodeProvider (optional)
 * - TestGenProvider
 * - BuildToolProvider
 * - Structurer
 */

providerContainer.bind<ToolchainContextProvider>(PROVIDER_TYPES.ToolchainContextProvider).to(SpringContextProvider);
providerContainer.bind<ToolchainContextProvider>(PROVIDER_TYPES.ToolchainContextProvider).to(JavaSdkVersionProvider);

providerContainer.bind<RelevantCodeProvider>(PROVIDER_TYPES.RelevantCodeProvider).to(JavaRelevantCodeProvider);
providerContainer.bind<TestGenProvider>(PROVIDER_TYPES.TestGenProvider).to(JavaTestGenProvider);
providerContainer.bind<BuildToolProvider>(PROVIDER_TYPES.BuildToolProvider).to(GradleBuildToolProvider);
providerContainer.bind<StructurerProvider>(PROVIDER_TYPES.StructurerProvider).to(JavaStructurerProvider);

// TypeScript
providerContainer.bind<ToolchainContextProvider>(PROVIDER_TYPES.ToolchainContextProvider).to(JavaScriptContextProvider);
providerContainer.bind<BuildToolProvider>(PROVIDER_TYPES.BuildToolProvider).to(NpmBuildToolProvider);
providerContainer.bind<TestGenProvider>(PROVIDER_TYPES.TestGenProvider).to(TypeScriptTestGenProvider);
providerContainer.bind<StructurerProvider>(PROVIDER_TYPES.StructurerProvider).to(TypeScriptStructurer);


// Golang
providerContainer.bind<BuildToolProvider>(PROVIDER_TYPES.BuildToolProvider).to(GoBuildToolProvider);
providerContainer.bind<StructurerProvider>(PROVIDER_TYPES.StructurerProvider).to(GoStructurerProvider);


/**
 * TODO: improve the design for LanguageProfile
 * In current design, since the unit test slowly in VSCode env, we separate some design out vscode env,
 * So the {@link LanguageProfile} should manual register in {@link TSLanguageUtil}
 */
languageContainer.getAll<LanguageProfile>(PROVIDER_TYPES.LanguageProfile).forEach((profile: LanguageProfile) => {
	providerContainer.bind(PROVIDER_TYPES.LanguageProfile).toConstantValue(profile);
});

export { providerContainer };
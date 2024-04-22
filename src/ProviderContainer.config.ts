import { Container } from "inversify";
import { PROVIDER_TYPES } from "./ProviderTypes";

import { ToolchainContextProvider } from "./toolchain-context/ToolchainContextProvider";
import { SpringContextProvider } from "./toolchain-context/framework/jvm/SpringContextProvider";
import { JavaSdkVersionProvider } from "./toolchain-context/sdk/JavaSdkVersionProvider";
import { JavaScriptContextProvider } from "./toolchain-context/framework/javascript/JavaScriptContextProvider";

import { RelatedCodeProvider } from "./code-context/_base/RelatedCodeProvider";
import { JavaRelatedProvider } from "./code-context/java/JavaRelatedProvider";
import { BuildToolProvider } from "./toolchain-context/buildtool/_base/BuildToolProvider";
import { NpmBuildToolProvider } from "./toolchain-context/buildtool/NpmBuildToolProvider";
import { GradleBuildToolProvider } from "./toolchain-context/buildtool/GradleBuildToolProvider";

import { JavaTestGenProvider } from "./code-context/java/JavaTestGenProvider";
import { TestGenProvider } from "./code-context/_base/test/TestGenProvider";
import { TypeScriptTestGenProvider } from "./code-context/typescript/TypeScriptTestGenProvider";
import { Structurer } from "./code-context/_base/BaseStructurer";
import { JavaStructurer } from "./code-context/java/JavaStructurer";
import { TypeScriptStructurer } from "./code-context/typescript/TypeScriptStructurer";
import { ActionCreator } from "./editor/action/_base/ActionCreator";
import { AutoDocActionCreator } from "./editor/action/autodoc/AutoDocActionCreator";
import { AutoTestActionCreator } from "./editor/action/autotest/AutoTestActionCreator";
import { GenApiDataActionCreator } from "./editor/action/api-data/GenApiDataActionCreator";

const providerContainer = new Container();

// Action Register
providerContainer.bind<ActionCreator>(PROVIDER_TYPES.ActionCreator).to(AutoDocActionCreator);
providerContainer.bind<ActionCreator>(PROVIDER_TYPES.ActionCreator).to(AutoTestActionCreator);
providerContainer.bind<ActionCreator>(PROVIDER_TYPES.ActionCreator).to(GenApiDataActionCreator);

// ChatContextProvider
providerContainer.bind<ToolchainContextProvider>(PROVIDER_TYPES.ChatContextProvider).to(SpringContextProvider);
providerContainer.bind<ToolchainContextProvider>(PROVIDER_TYPES.ChatContextProvider).to(JavaSdkVersionProvider);
providerContainer.bind<ToolchainContextProvider>(PROVIDER_TYPES.ChatContextProvider).to(JavaScriptContextProvider);

/**
 * A Language need to have a:
 * - RelatedCodeProvider (optional)
 * - TestGenProvider
 * - BuildToolProvider
 * - Structurer
 */

// Java
providerContainer.bind<RelatedCodeProvider>(PROVIDER_TYPES.RelatedCodeProvider).to(JavaRelatedProvider);
providerContainer.bind<TestGenProvider>(PROVIDER_TYPES.TestGenProvider).to(JavaTestGenProvider);
providerContainer.bind<BuildToolProvider>(PROVIDER_TYPES.BuildToolProvider).to(GradleBuildToolProvider);
providerContainer.bind<Structurer>(PROVIDER_TYPES.Structurer).to(JavaStructurer);

// TypeScript
providerContainer.bind<BuildToolProvider>(PROVIDER_TYPES.BuildToolProvider).to(NpmBuildToolProvider);
providerContainer.bind<TestGenProvider>(PROVIDER_TYPES.TestGenProvider).to(TypeScriptTestGenProvider);
providerContainer.bind<Structurer>(PROVIDER_TYPES.Structurer).to(TypeScriptStructurer);

export { providerContainer };
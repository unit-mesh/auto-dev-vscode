import { Container } from "inversify";
import { PROVIDER_TYPES } from "./ProviderTypes";

import { ChatContextProvider } from "./chat-context/ChatContextProvider";
import { SpringContextProvider } from "./chat-context/framework/jvm/SpringContextProvider";
import { JavaSdkVersionProvider } from "./chat-context/sdk/JavaSdkVersionProvider";
import { JavaScriptContextProvider } from "./chat-context/framework/javascript/JavaScriptContextProvider";

import { RelatedCodeProvider } from "./code-context/_base/RelatedCodeProvider";
import { JavaRelatedProvider } from "./code-context/java/JavaRelatedProvider";
import { BuildToolProvider } from "./chat-context/tooling/_base/BuildToolProvider";
import { NpmBuildToolProvider } from "./chat-context/tooling/NpmBuildToolProvider";
import { GradleBuildToolProvider } from "./chat-context/tooling/GradleBuildToolProvider";

import { JavaTestGenProvider } from "./code-context/java/JavaTestGenProvider";
import { TestGenProvider } from "./code-context/_base/test/TestGenProvider";
import { TypeScriptTestGenProvider } from "./code-context/typescript/TypeScriptTestGenProvider";
import { Structurer } from "./code-context/_base/BaseStructurer";
import { JavaStructurer } from "./code-context/java/JavaStructurer";
import { TypeScriptStructurer } from "./code-context/typescript/TypeScriptStructurer";
import { ActionCreator } from "./editor/action/_base/ActionCreator";
import { AutoDocCreator } from "./editor/action/autodoc/AutoDocCreator";
import { AutoTestCreator } from "./editor/action/autotest/AutoTestCreator";

const providerContainer = new Container();

// Action Register
providerContainer.bind<ActionCreator>(PROVIDER_TYPES.ActionCreator).to(AutoDocCreator);
providerContainer.bind<ActionCreator>(PROVIDER_TYPES.ActionCreator).to(AutoTestCreator);

// ChatContextProvider
providerContainer.bind<ChatContextProvider>(PROVIDER_TYPES.ChatContextProvider).to(SpringContextProvider);
providerContainer.bind<ChatContextProvider>(PROVIDER_TYPES.ChatContextProvider).to(JavaSdkVersionProvider);
providerContainer.bind<ChatContextProvider>(PROVIDER_TYPES.ChatContextProvider).to(JavaScriptContextProvider);

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
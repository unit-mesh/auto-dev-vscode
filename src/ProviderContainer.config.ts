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

const providerContainer = new Container();

// ChatContextProvider
providerContainer.bind<ChatContextProvider>(PROVIDER_TYPES.ChatContextProvider).to(SpringContextProvider);
providerContainer.bind<ChatContextProvider>(PROVIDER_TYPES.ChatContextProvider).to(JavaSdkVersionProvider);
providerContainer.bind<ChatContextProvider>(PROVIDER_TYPES.ChatContextProvider).to(JavaScriptContextProvider);

// RelatedCodeProvider
providerContainer.bind<RelatedCodeProvider>(PROVIDER_TYPES.RelatedCodeProvider).to(JavaRelatedProvider);


// Tooling
providerContainer.bind<BuildToolProvider>(PROVIDER_TYPES.BuildToolProvider).to(NpmBuildToolProvider);
providerContainer.bind<BuildToolProvider>(PROVIDER_TYPES.BuildToolProvider).to(GradleBuildToolProvider);

// TestGenProvider
providerContainer.bind<TestGenProvider>(PROVIDER_TYPES.TestGenProvider).to(JavaTestGenProvider);
providerContainer.bind<TestGenProvider>(PROVIDER_TYPES.TestGenProvider).to(TypeScriptTestGenProvider);

// PlantUML like Structurer
providerContainer.bind<Structurer>(PROVIDER_TYPES.Structurer).to(JavaStructurer);

export { providerContainer };
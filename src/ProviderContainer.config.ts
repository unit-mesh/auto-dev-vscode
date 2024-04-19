import { Container } from "inversify";
import { PROVIDER_TYPES } from "./ProviderTypes";

import { ChatContextProvider } from "./chat-context/ChatContextProvider";
import { SpringContextProvider } from "./chat-context/framework/jvm/SpringContextProvider";
import { JavaSdkVersionProvider } from "./chat-context/sdk/JavaSdkVersionProvider";
import { JavaScriptContextProvider } from "./chat-context/framework/javascript/JavaScriptContextProvider";

import { RelatedCodeProvider } from "./code-context/_base/RelatedCodeProvider";
import { JavaRelatedProvider } from "./code-context/java/JavaRelatedProvider";

const providerContainer = new Container();

// ChatContextProvider
providerContainer.bind<ChatContextProvider>(PROVIDER_TYPES.ChatContextProvider).to(SpringContextProvider);
providerContainer.bind<ChatContextProvider>(PROVIDER_TYPES.ChatContextProvider).to(JavaSdkVersionProvider);
providerContainer.bind<ChatContextProvider>(PROVIDER_TYPES.ChatContextProvider).to(JavaScriptContextProvider);

// RelatedCodeProvider
providerContainer.bind<RelatedCodeProvider>(PROVIDER_TYPES.RelatedCodeProvider).to(JavaRelatedProvider);

export { providerContainer };
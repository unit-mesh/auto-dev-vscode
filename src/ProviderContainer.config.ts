import { Container } from "inversify";
import { ChatContextProvider } from "./chat-context/ChatContextProvider";
import { PROVIDER_TYPES } from "./ProviderTypes";
import { SpringContextProvider } from "./chat-context/framework/jvm/SpringContextProvider";

const providerContainer = new Container();
providerContainer.bind<ChatContextProvider>(PROVIDER_TYPES.ChatContextProvider).to(SpringContextProvider);

export { providerContainer };
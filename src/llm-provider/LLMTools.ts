import { ChatAnthropic } from "@langchain/anthropic";
import { ChatMessage } from "@langchain/core/messages";
import { ChatOpenAI, AzureChatOpenAI } from "@langchain/openai";
import * as vscode from "vscode";

import { ChatBaiduWenxin } from "./chat-models/wenxin";
import { ChatAlibabaTongyi } from "./chat-models/tongyi";
import { SettingService } from "../settings/SettingService";
import { channel } from "../channel";

interface LLMConfig extends ChatModelCallOptions {
  title: string;
}

// TODO Support configuration updates
export function getChatModelList(): LLMConfig[] {
  const setting = SettingService.instance();

  // TODO: Legacy config migration
  const legacyChatModels = setting.get<LLMConfig[]>("chatModels");
  if (legacyChatModels) {
    channel.warn('Deprecated: autodev.chatModels no longer supports, Please use `autodev.chat.models` instead.');
    return legacyChatModels;
  }

  return setting.get<LLMConfig[]>("chat.models", []);
}

function findChatModelConfig(title: string) {
  const chatModels = getChatModelList();
  return chatModels.find((model) => model.title === title);
}

export function callAI(data: {
  title: string;
  completionOptions?: object;
  messages: any[];
}) {
  const config = findChatModelConfig(data.title);

  if (!config) {
    vscode.window.showErrorMessage(
      `Failed to find chat model configuration for ${data.title}`
    );
    return;
  }

  const model = createChatModel({
    ...config,
    ...data.completionOptions,
  });

  return model.stream(
    data.messages.map((choice: any) => {
      if (config.provider === "qianfan") {
        return new ChatMessage({
          role: choice.role,
          content: choice.content[0].text,
        });
      }

      return new ChatMessage({
        role: choice.role,
        content: choice.content,
      });
    })
  );
}

export interface ChatModelCallOptions {
  provider?: "anthropic" | "openai" | "qianfan" | "tongyi";

  /**
   * Override the default base URL for the API, e.g., "https://api.example.com/v2/"
   */
  baseURL?: string;
  /**
   * API key to use when making requests to LLM Server.
   */
  apiKey?: string | undefined;

  /**
   * Secret key to use when making requests.
   *
   * For example: ChatBaiduWenxin
   */
  secretKey?: string | undefined;

  /**
   * The name of the model to use.
   */
  model?: string | undefined;

  /** Amount of randomness injected into the response. Ranges
   * from 0 to 1. Use temp closer to 0 for analytical /
   * multiple choice, and temp closer to 1 for creative
   * and generative tasks.
   */
  temperature?: number;

  /** A maximum number of tokens to generate before stopping. */
  maxTokens?: number;

  /**
   * A list of strings to use as stop words.
   */
  stop?: string[] | undefined;

  /**
   * Client options to pass to the LLM client.
   */
  clientOptions?: object | undefined;
}

export function createChatModel(options: ChatModelCallOptions) {
  if (options.provider === "anthropic") {
    return createAnthropicChatModel(options);
  }

  if (options.provider === "qianfan") {
    return createQianFanChatModel(options);
  }

  if (options.provider === "tongyi") {
    return createTongYiChatModel(options);
  }

  return createOpenAIChatModel(options);
}

export function createAnthropicChatModel(config: ChatModelCallOptions) {
  const defaults = SettingService.instance().getAnthropicConfig();

  const callOptions = {
    streaming: true,
    anthropicApiKey: config.apiKey || defaults.apiKey,
    anthropicApiUrl: config.baseURL || defaults.baseURL,
    model: config.model || defaults.model,
    temperature: config.temperature,
    stopSequences: config.stop,
    maxTokens: config.maxTokens,
    clientOptions: {
      ...config.clientOptions,
    },
  };

  channel.debug("(LLM): Use Anthropic provider send", callOptions);

  return new ChatAnthropic(callOptions);
}

export function createOpenAIChatModel(config: ChatModelCallOptions) {
  const defaults = SettingService.instance().getOpenAIConfig();

  if (defaults.apiType === "azure") {
    const azureCallOptions = {
      streaming: true,
      apiKey: config.apiKey || defaults.apiKey,
      model: config.model || defaults.model,
      temperature: config.temperature,
      azureOpenAIApiKey: config.apiKey || defaults.apiKey,
      azureOpenAIBasePath: config.baseURL || defaults.baseURL,
      stop: config.stop,
      maxTokens: config.maxTokens,
      configuration: {
        ...config.clientOptions,
      },
    };

    channel.debug(
      "(LLM): Use OpenAI provider send to Azure",
      azureCallOptions
    );
    return new AzureChatOpenAI(azureCallOptions);
  }

  const openaiCallOptions = {
    streaming: true,
    apiKey: config.apiKey || defaults.apiKey,
    model: config.model || defaults.model,
    temperature: config.temperature,
    stop: config.stop,
    maxTokens: config.maxTokens,
    configuration: {
      baseURL: config.baseURL || defaults.baseURL,
      organization: defaults.organization,
      project: defaults.project,
      ...config.clientOptions,
    },
  };

  channel.debug("(LLM): Use OpenAI provider send", openaiCallOptions);

  return new ChatOpenAI(openaiCallOptions);
}

export function createQianFanChatModel(config: ChatModelCallOptions) {
  const defaults = SettingService.instance().getQianFanConfig();

  const callOptions = {
    ...config.clientOptions,
    streaming: true,
    baiduApiKey: config.apiKey || defaults.apiKey,
    baiduSecretKey: config.secretKey || defaults.secretKey,
    model: config.model || defaults.model,
    temperature: config.temperature,
  };

  channel.debug("(LLM): Use QianFan provider send", callOptions);

  return new ChatBaiduWenxin(callOptions);
}

export function createTongYiChatModel(config: ChatModelCallOptions) {
  const defaults = SettingService.instance().getTongYiConfig();

  const callOptions = {
    ...config.clientOptions,
    streaming: true,
    alibabaApiKey: config.apiKey || defaults.apiKey,
    model: config.model || defaults.model,
    temperature: config.temperature,
    enableSearch: defaults.enableSearch,
  };

  channel.debug("(LLM): Use TongYi provider send", callOptions);

  return new ChatAlibabaTongyi(callOptions);
}

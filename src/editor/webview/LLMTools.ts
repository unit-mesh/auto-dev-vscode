import { ChatAnthropic } from "@langchain/anthropic";
import { ChatMessage } from "@langchain/core/messages";
import { ChatAlibabaTongyi } from "@langchain/community/chat_models/alibaba_tongyi";
import { ChatBaiduWenxin } from "@langchain/community/chat_models/baiduwenxin";
import { ChatOpenAI } from "@langchain/openai";

import * as vscode from "vscode";

import { getExtensionUri } from "../../context";

export function getChatModelList(): any[] {
  return vscode.workspace
    .getConfiguration("autodev", getExtensionUri())
    .get("chatModels") as any[];
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

  if (!config) return;

  const model = createChatModel({
    ...config,
    ...data.completionOptions,
  });

  return model.stream(
    data.messages.map((choice: any) => {
      if (config.provider === "qianfan") {
        return new ChatMessage({
          role: choice.role,
          content: choice.content[0].text
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
  provider?: string;

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
    return createQianfanChatModel(options);
  }

  if (options.provider === "tongyi") {
    return createTongyiChatModel(options);
  }

  return createOpenaiChatModel(options);
}

export function createAnthropicChatModel(config: ChatModelCallOptions) {
  return new ChatAnthropic({
    streaming: true,
    anthropicApiKey: config.apiKey,
    anthropicApiUrl: config.baseURL,
    model: config.model,
    temperature: config.temperature,
    stopSequences: config.stop,
    maxTokens: config.maxTokens,
    clientOptions: {
      ...config.clientOptions,
    },
  });
}

export function createOpenaiChatModel(config: ChatModelCallOptions) {
  return new ChatOpenAI({
    streaming: true,
    apiKey: config.apiKey,
    model: config.model,
    temperature: config.temperature,
    stop: config.stop,
    maxTokens: config.maxTokens,
    configuration: {
      baseURL: config.baseURL,
      ...config.clientOptions,
    },
  });
}

export function createQianfanChatModel(config: ChatModelCallOptions) {
  return new ChatBaiduWenxin({
    streaming: true,
    baiduApiKey: config.apiKey,
    baiduSecretKey: config.secretKey,
    model: config.model,
    temperature: config.temperature,
    ...config.clientOptions,
  });
}

export function createTongyiChatModel(config: ChatModelCallOptions) {
  return new ChatAlibabaTongyi({
    streaming: true,
    alibabaApiKey: config.apiKey,
    model: config.model,
    temperature: config.temperature,
    maxTokens: config.maxTokens,
    enableSearch: true,
    ...config.clientOptions,
  });
}

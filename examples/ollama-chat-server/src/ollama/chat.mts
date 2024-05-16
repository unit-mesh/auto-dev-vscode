/* eslint-disable curly */
/* eslint-disable @typescript-eslint/naming-convention */
import assert from "node:assert";

import type { OpenAI } from "openai";

import { OLLAMA_BASE_URL, OLLAMA_CHAT_MODELS } from "../environment.mjs";
import { flushObject, randomId } from "../base/util.mjs";

export async function sendChatRequest(
  params: OpenAI.ChatCompletionCreateParams,
  signal?: AbortSignal
): Promise<string | ReadableStream>;
export async function sendChatRequest(
  params: OpenAI.ChatCompletionCreateParamsNonStreaming,
  signal?: AbortSignal
): Promise<string>;
export async function sendChatRequest(
  params: OpenAI.ChatCompletionCreateParamsStreaming,
  signal?: AbortSignal
): Promise<ReadableStream>;
export async function sendChatRequest(
  params: OpenAI.ChatCompletionCreateParams,
  signal?: AbortSignal
): Promise<string | ReadableStream> {
  const response = await fetch(new URL("/api/chat", OLLAMA_BASE_URL), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(mapToOllamaChatCompletionCreateParams(params)),
    signal: signal,
  });

  if (params.stream) {
    const body = response.body;
    assert.ok(body, "Response body must be a readable stream");

    const abortController = new AbortController();

    const stream = new ReadableStream({
      async start(controller) {
        const eventStream = body.pipeThrough(new TextDecoderStream());

        const encoder = new TextEncoder();

        for await (const chunk of eventStream) {
          try {
            const data = JSON.parse(chunk);

            if (data.done) {
              controller.enqueue(encoder.encode("[DONE]"));
              controller.close();
              break;
            }

            const message = JSON.stringify(
              mapToOpenAIChatCompletionChunk(data)
            );
            controller.enqueue(encoder.encode(`data: ${message}\n\n`));
          } catch (e) {
            controller.error(e);
          }
        }
      },
      cancel(reason?: any) {
        abortController.abort(reason);
      },
    });

    signal?.addEventListener("abort", (event) => {
      stream.cancel();
      abortController.abort();
    });

    return stream;
  }

  return JSON.stringify(mapToOpenAIChatCompletion(await response.json()));
}

/**
 * TODO support images params
 * see https://github.com/ollama/ollama/blob/main/docs/modelfile.md#valid-parameters-and-values
 */
function mapToOllamaChatCompletionCreateParams(
  params: OpenAI.ChatCompletionCreateParams
) {
  const model = params.model;
  assert.equal(
    OLLAMA_CHAT_MODELS.includes(model),
    true,
    `Invalid model, must be one of ${OLLAMA_CHAT_MODELS.join(", ")}`
  );

  const messages = params.messages || [];

  const humanMessage = messages[messages.length - 1];
  assert.ok(humanMessage.role === "user", "Last message must be from the user");
  assert.ok(!!humanMessage.content.toString().trim(), "Prompt is required");

  const format =
    params.response_format?.type === "json_object" ? "json" : undefined;

  const options = flushObject({
    seed: params.seed,
    top_k: params.n,
    top_p: params.top_p,
    temperature: params.temperature,
    presence_penalty: params.presence_penalty,
    frequency_penalty: params.frequency_penalty,
    stop: params.stop,
  });

  return flushObject({
    stream: params.stream === true,
    model: model,
    messages: messages,
    options: options,
    format: format,
  });
}

function mapToOpenAIChatCompletion(
  data: OllamaChatCompletion
): OpenAI.ChatCompletion {
  const { model, message, created_at, eval_count } = data;

  const choice: OpenAI.ChatCompletion.Choice = {
    index: 0,
    message: message,
    logprobs: null,
    finish_reason: "stop",
  };

  return {
    id: `chatcmpl-${randomId()}`,
    choices: [choice],
    created: Date.parse(created_at),
    model: model,
    object: "chat.completion",
    usage: {
      completion_tokens: eval_count,
      prompt_tokens: 0,
      total_tokens: eval_count,
    },
  };
}

function mapToOpenAIChatCompletionChunk(
  data: OllamaChatCompletionChunk
): OpenAI.ChatCompletionChunk {
  const { model, created_at, message, done, eval_count } = data;

  const choice: OpenAI.ChatCompletionChunk.Choice = {
    index: 0,
    delta: message,
    logprobs: null,
    finish_reason: done === true ? "stop" : null,
  };

  return {
    id: `chatcmpl-${randomId()}`,
    choices: [choice],
    created: Date.parse(created_at),
    model: model,
    object: "chat.completion.chunk",
    usage: {
      completion_tokens: eval_count || 0,
      prompt_tokens: 0,
      total_tokens: eval_count || 0,
    },
  };
}

export interface OllamaChatCompletion extends OllamaCompletionUsage {
  model: string;
  created_at: string;
  message: OpenAI.ChatCompletionMessage;
  done: true;
}

export interface OllamaCompletionUsage {
  total_duration: number;
  load_duration: number;
  prompt_eval_duration: number;
  eval_count: number;
  eval_duration: number;
}

export interface OllamaChatCompletionChunkBase
  extends Partial<OllamaCompletionUsage> {
  model: string;
  created_at: string;
  message: OpenAI.ChatCompletionChunk.Choice.Delta;
  done: boolean;
}

export interface OllamaChatCompletionGenerationChunk
  extends OllamaChatCompletionChunkBase {
  done: false;
}

export interface OllamaChatCompletionFinishedChunk
  extends OllamaChatCompletionChunkBase {
  done: true;
}

export type OllamaChatCompletionChunk =
  | OllamaChatCompletionChunkBase
  | OllamaChatCompletionGenerationChunk
  | OllamaChatCompletionFinishedChunk;

/* eslint-disable @typescript-eslint/naming-convention */
import type { IncomingMessage, ServerResponse } from "node:http";
import { Readable } from "node:stream";
import { ReadableStream } from "node:stream/web";

import type { OpenAI } from "openai";

import body from "../base/http/body.mjs";
import { sendChatRequest } from "../ollama/chat.mjs";

export const POST = async function (
  req: IncomingMessage,
  res: ServerResponse<IncomingMessage>
) {
  const params = await body.json<OpenAI.ChatCompletionCreateParams>(req);
  const response = await sendChatRequest(params);

  if (params.stream) {
    res.writeHead(200, {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Transfer-Encoding": "chunked",
    });
    Readable.fromWeb(response as ReadableStream).pipe(res);
  } else {
    res.writeHead(200, {
      "Content-Type": "application/json",
    });
    res.end(response);
  }
};

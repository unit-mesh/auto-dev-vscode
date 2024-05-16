/* eslint-disable curly */
/* eslint-disable @typescript-eslint/naming-convention */
import { STATUS_CODES, IncomingMessage, ServerResponse } from "node:http";
import { format } from "node:util";
import { Buffer } from "node:buffer";

import { canWritable } from "../http/response.mjs";

function formatErrorMessage(err?: unknown) {
  let message: string | undefined;

  if (process.env.NODE_ENV === "development") {
    message =
      err instanceof Error ? err.stack : format("non-error thrown: %j", err);
  }

  if (!message) {
    message = STATUS_CODES["500"] || "server error";
  }

  return message;
}

export function errorHandler(
  _: IncomingMessage,
  res: ServerResponse<IncomingMessage>,
  error?: unknown
) {
  if (!canWritable(res)) return;

  const isHeadersNoSent = !res.headersSent;
  const noType = res.hasHeader("Content-Type") !== true;

  const message = formatErrorMessage(error);

  if (isHeadersNoSent) {
    if (noType) {
      res.setHeader("Content-Type", "text/plan");
    }

    res.setHeader("Content-Length", Buffer.byteLength(message as string));
  }

  res.statusCode = 500;
  res.end(message, "utf8");
}

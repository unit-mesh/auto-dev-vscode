/* eslint-disable @typescript-eslint/naming-convention */
import { IncomingMessage, ServerResponse } from "node:http";

export function notFound(
  _: IncomingMessage,
  res: ServerResponse<IncomingMessage>
) {
  res.writeHead(404, {
    "Content-Type": "text/plain",
  });
  res.write("Not Found", "utf8");
  res.end();
}

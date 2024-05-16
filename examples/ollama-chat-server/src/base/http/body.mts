import assert from "node:assert";
import { IncomingMessage } from "http";

export function json<T = unknown>(req: IncomingMessage) {
  assert.ok(
    req.headers["content-type"] === "application/json",
    "Invalid content type"
  );

  return new Promise<T>((resolve, reject) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
  });
}

export default {
  json,
};

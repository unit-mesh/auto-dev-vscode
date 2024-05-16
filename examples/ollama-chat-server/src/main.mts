/* eslint-disable @typescript-eslint/naming-convention */
import { IncomingMessage, ServerResponse, createServer } from "node:http";

import * as chat from "./routes/chat.mjs";
import { notFound } from "./base/errors/notFound.mjs";
import { errorHandler } from "./base/errors/serverError.mjs";
import { HOST, PORT } from "./environment.mjs";

type Handle = (
  req: IncomingMessage,
  res: ServerResponse<IncomingMessage>
) => void;

type Route = {
  GET?: Handle;
  POST?: Handle;
  PUT?: Handle;
  DELETE?: Handle;
  PATCH?: Handle;
  HEAD?: Handle;
  handle?: Handle;
};

const ROUTES = new Map<string, Route>([["/chat/completions", chat]]);

function getHandle(req: IncomingMessage): Handle | void {
  const method = (req.method?.toUpperCase() || "GET") as keyof Route;
  const route = ROUTES.get(req.url || "/");

  if (route) {
    return route[method] || route.handle;
  }
}

const server = createServer(async (req, res) => {
  try {
    const handle = getHandle(req);

    if (handle) {
      await handle(req, res);
    } else {
      await notFound(req, res);
    }
  } catch (error) {
    console.error(error);

    errorHandler(req, res, error);
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

import {
  defaultsArray,
  getEnv,
  safeInteger,
  stringToArray,
} from "./base/util.mjs";

export const PORT = safeInteger(getEnv("PORT"), 1234);

export const HOST = getEnv("HOST", "localhost");

export const DEFAULT_BASE_URL = `http://${HOST}:${PORT}`;

// See https://github.com/ollama/ollama/blob/main/docs/api.md
export const OLLAMA_BASE_URL = getEnv(
  "OLLAMA_BASE_URL",
  "http://127.0.0.1:11434"
);

export const OLLAMA_CHAT_MODELS = defaultsArray(
  stringToArray(getEnv("OLLAMA_CHAT_MODELS")),
  ["llama3"]
);

export const OLLAMA_CHAT_MODEL = OLLAMA_CHAT_MODELS[0];

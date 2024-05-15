export const SUPPORTED_LANGUAGES = [
  "c",
  "cpp",
  "csharp",
  "go",
  "java",
  "kotlin",
  "python",
  "rust",
  "javascript",
  "typescript",
  "typescriptreact",
];

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export function isSupportedLanguage(lang: string): lang is SupportedLanguage {
  return SUPPORTED_LANGUAGES.includes(lang);
}
export const SUPPORTED_LANGUAGES = [
    "c",
    "cpp",
    "csharp",
    "go",
    "java",
    "javascript",
    "typescript",
    "python",
    "rust"
] as const;

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

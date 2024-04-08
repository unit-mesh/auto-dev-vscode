export const SUPPORTED_LANGID = [
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

export type SupportedLangId = typeof SUPPORTED_LANGID[number];
import { SupportedLanguage } from "./SupportedLanguage";

export const LANGUAGE_LINE_COMMENT_MAP: { [key: SupportedLanguage]: string } = {
	"c": "//",
	"cpp": "//",
	"csharp": "//",
	"go": "//",
	"java": "//",
	"python": "#",
	"rust": "//",
	"javascript": "//",
	"typescript": "//",
	"typescriptreact": "//",
};

export const LANGUAGE_BLOCK_COMMENT_MAP: { [key: SupportedLanguage]: { start: string, end: string } } = {
	"c": { start: "/*", end: "*/" },
	"cpp": { start: "/*", end: "*/" },
	"csharp": { start: "/*", end: "*/" },
	"go": { start: "/*", end: "*/" },
	"java": { start: "/*", end: "*/" },
	"python": { start: '"""', end: '"""' },
	"rust": { start: "/*", end: "*/" },
	"javascript": { start: "/*", end: "*/" },
	"typescript": { start: "/*", end: "*/" },
	"typescriptreact": { start: "/*", end: "*/" },
};

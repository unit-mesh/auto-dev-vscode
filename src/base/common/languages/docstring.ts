import { type LanguageIdentifier } from './languages';

export const LANGUAGE_LINE_COMMENT_MAP: Partial<Record<LanguageIdentifier, string>> = {
	c: '//',
	cpp: '//',
	csharp: '//',
	go: '//',
	java: '//',
	python: '#',
	rust: '//',
	javascript: '//',
	typescript: '//',
	typescriptreact: '//',
};

export const LANGUAGE_BLOCK_COMMENT_MAP: Partial<Record<LanguageIdentifier, { start: string; end: string }>> = {
	c: { start: '/*', end: '*/' },
	cpp: { start: '/*', end: '*/' },
	csharp: { start: '/*', end: '*/' },
	go: { start: '/*', end: '*/' },
	java: { start: '/*', end: '*/' },
	python: { start: '"""', end: '"""' },
	rust: { start: '/*', end: '*/' },
	javascript: { start: '/*', end: '*/' },
	typescript: { start: '/*', end: '*/' },
	typescriptreact: { start: '/*', end: '*/' },
};

export const LANGUAGE_COMMENT_RULE: Partial<Record<LanguageIdentifier, string[]>> = {
	java: [`use @param tag`, `use @return tag`, `do not return example code`, `do not use @author and @version tags`],
};

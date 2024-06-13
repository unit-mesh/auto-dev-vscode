/* eslint-disable @typescript-eslint/naming-convention */
import path from 'node:path';

type SupportedLanguage =
	| 'c'
	| 'cpp'
	| 'csharp'
	| 'go'
	| 'java'
	| 'kotlin'
	| 'python'
	| 'rust'
	| 'javascript'
	// | 'javascriptreact'
	| 'typescript'
	| 'typescriptreact';

export type LanguageIdentifier = SupportedLanguage | (string & {});

export const SUPPORTED_LANGUAGES: LanguageIdentifier[] = [
	'c',
	'cpp',
	'csharp',
	'go',
	'java',
	'kotlin',
	'python',
	'rust',
	'javascript',
	// 'javascriptreact',
	'typescript',
	'typescriptreact',
];

export function isSupportedLanguage(lang: LanguageIdentifier) {
	return SUPPORTED_LANGUAGES.includes(lang);
}

type LanguageItem = {
	languageId: LanguageIdentifier;
	families?: string[];
	fileExts: string[];
};

const SupportLanguagesList: LanguageItem[] = [
	{
		languageId: 'cpp',
		fileExts: ['.c', '.cc', '.cpp', '.cxx', '.hh', '.h', '.hpp', '.ino', '.m', '.pc', '.pcc'],
	},
	{
		languageId: 'csharp',
		fileExts: ['.cs', '.cln', '.aspx'],
	},
	{ languageId: 'go', fileExts: ['.go'] },
	{ languageId: 'java', fileExts: ['.java'] },
	{
		languageId: 'kotlin',
		fileExts: ['.kt, .kts, .ktm'],
	},
	{ languageId: 'python', fileExts: ['.py'] },
	{
		languageId: 'rust',
		fileExts: ['.rs', '.rs.in'],
	},
	{
		languageId: 'javascript',
		fileExts: ['.js', '.cjs', '.mjs'],
	},
	// {
	// 	languageId: 'javascriptreact',
	// 	fileExts: ['.jsx'],
	// },
	{ languageId: 'typescript', fileExts: ['.ts', '.mts'] },
	{
		languageId: 'typescriptreact',
		fileExts: ['.tsx'],
	},
];

const retrieveCache = new Map<string, string>();

/**
 * Infer the language of a file based on its filename.
 *
 * @param filename - The filename to infer the language from.
 * @returns The inferred language or undefined if the language could not be inferred.
 */
export function inferLanguage(filename: string): string {
	const extname = path.extname(filename);

	if (retrieveCache.has(extname)) {
		return retrieveCache.get(extname)!;
	}

	const found = SupportLanguagesList.find(item => item.fileExts.some(ext => filename.endsWith(ext)));

	const languageId = found?.languageId || '';

	retrieveCache.set(extname, languageId);

	return languageId;
}

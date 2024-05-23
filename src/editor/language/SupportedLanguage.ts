const SupportLanguagesList = [
	{
		languageId: "cpp",
		families: ["c", "cpp"],
		fileExts: [
			".c",
			".cc",
			".cpp",
			".cxx",
			".hh",
			".h",
			".hpp",
			".ino",
			".m",
			".pc",
			".pcc",
		],
	},
	{
		languageId: "csharp",
		fileExts: [".cs", ".cln", ".aspx"],
	},
	{ languageId: "go", fileExts: [".go"] },
	{ languageId: "java", fileExts: [".java"] },
	{
		languageId: "kotlin",
		fileExts: [".kt, .kts, .ktm"],
	},
	{ languageId: "python", fileExts: [".py"] },
	{
		languageId: "rust",
		fileExts: [".rs", ".rs.in"],
	},
	{
		languageId: "javascript",
		fileExts: [".js", ".cjs", ".mjs"],
	},
	{
		languageId: "javascriptreact",
		fileExts: [".js", ".cjs", ".mjs"],
	},
	{ languageId: "typescript", fileExts: [".ts", ".mts"] },
	{
		languageId: "typescriptreact",
		fileExts: [".tsx"],
	},
];

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

export function isSupportedLanguage(lang: string) {
	return SUPPORTED_LANGUAGES.includes(lang);
}

/**
 * Infer the language of a file based on its filename.
 *
 * @param filename - The filename to infer the language from.
 * @returns The inferred language or undefined if the language could not be inferred.
 */
export function inferLanguage(filename: string): string | undefined {
	const found = SupportLanguagesList.find((item) =>
		item.fileExts.some((ext) => filename.endsWith(ext))
	);

	return found?.languageId;
}

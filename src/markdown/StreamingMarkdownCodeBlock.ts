import { SUPPORTED_LANGUAGES } from "../editor/language/SupportedLanguage";

/**
 * FencedCodeBlock class represents a block of code that is delimited by triple backticks (```) and can optionally have a
 * language identifier.
 *
 * This class is used to parse and represent code blocks within Markdown or other text documents. It provides methods to
 * parse the content of a code block and to retrieve the language identifier and the code itself.
 *
 * @class FencedCodeBlock
 * @param {string} language The language identifier of the code block.
 * @param {string} text The text content of the code block.
 * @param {boolean} isComplete Indicates whether the code block is complete or not.
 */
export class StreamingMarkdownCodeBlock {
	language: string;
	text: string;
	isComplete: boolean;

	constructor(language: string, text: string, isComplete: boolean) {
		this.language = language;
		this.text = text;
		this.isComplete = isComplete;
	}

	static parse(content: string): StreamingMarkdownCodeBlock {
		const regex = /```([\w#+]*)/;
		// convert content \\n to \n
		const lines = content.replace(/\\n/g, "\n").split("\n");

		let codeStarted = false;
		let codeClosed = false;
		let languageId: string | null = null;
		const codeBuilder: string[] = [];

		for (const line of lines) {
			if (!codeStarted) {
				const matchResult = line.trimStart().match(regex);
				if (matchResult) {
					languageId = matchResult[1];
					codeStarted = true;
				}
			} else if (line.startsWith("```")) {
				codeClosed = true;
				break;
			} else {
				codeBuilder.push(line);
			}
		}

		let startIndex = 0;
		let endIndex = codeBuilder.length - 1;

		while (startIndex <= endIndex) {
			if (!codeBuilder[startIndex].trim()) {
				startIndex++;
			} else {
				break;
			}
		}

		while (endIndex >= startIndex) {
			if (!codeBuilder[endIndex].trim()) {
				endIndex--;
			} else {
				break;
			}
		}

		let trimmedCode = codeBuilder.slice(startIndex, endIndex + 1).join("\n");
		const language = StreamingMarkdownCodeBlock.findLanguage(languageId || "");

		// if content is not empty, but code is empty, then it's a markdown
		if (!trimmedCode.trim()) {
			return new StreamingMarkdownCodeBlock("markdown", content.replace(/\\n/g, "\n"), codeClosed);
		}

		if (languageId === "devin" || languageId === "devins") {
			trimmedCode = trimmedCode.replace(/\\`\\`\\`/g, "```");
		}

		return new StreamingMarkdownCodeBlock(language, trimmedCode, codeClosed);
	}

	/**
	 * Searches for a language by its name and returns the corresponding Language object. If the language is not found,
	 * PlainTextLanguage is returned.
	 *
	 * @param languageName The name of the language to find.
	 * @return The Language object corresponding to the given name, or PlainTextLanguage if the language is not found.
	 */
	static findLanguage(languageName: string): string {
		let fixedLanguage = languageName;
		switch (languageName.toLowerCase()) {
			case "c#":
				fixedLanguage = "csharp";
				break;
			case "c++":
				fixedLanguage = "cpp";
				break;
		}

		const registeredLanguages = SUPPORTED_LANGUAGES.filter(lang => lang);
		return registeredLanguages.find(lang => lang.toLowerCase() === fixedLanguage.toLowerCase()) || "markdown";
	}
}

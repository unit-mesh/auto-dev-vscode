import { SUPPORTED_LANGUAGES } from "../editor/language/SupportedLanguage";

export class StandardCodeBlock {
	language: string;
	startLine: number;
	endLine: number;
	code: string;

	constructor(language: string, startLine: number, endLine: number, code: string) {
		this.language = language;
		this.startLine = startLine;
		this.endLine = endLine;
		this.code = code;
	}

	static from(markdown: string): StandardCodeBlock[] {
		const regex = /```(\w+)?\s([\s\S]*?)```/gm;
		const blocks: StandardCodeBlock[] = [];
		let match;

		while ((match = regex.exec(markdown)) !== null) {
			const startLine = markdown.substring(0, match.index).split("\n").length;
			const endLine = startLine + match[0].split("\n").length - 1;
			blocks.push(new StandardCodeBlock(match[1] || 'plaintext', startLine, endLine, match[2]));
		}

		return blocks;
	}
}

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
	startIndex: number = 0;
	endIndex: number = 0;

	constructor(language: string, text: string, isComplete: boolean, startIndex: number = 0, endIndex: number = 0) {
		this.language = language;
		this.text = text;
		this.isComplete = isComplete;

		// for split
		this.startIndex = startIndex;
		this.endIndex = endIndex;
	}

	static multiLineCodeBlock(content: string, defaultLanguage: string = "") {
		const regex = /```([\w#+]*?)\s*$/;
		const lines = content.replace(/\\n/g, "\n").split("\n");

		let lastBlockStartIndex = 0;
		let codeBlocks: StandardCodeBlock[] = [];
		let language = defaultLanguage;
		let blockContent: string[] = [];

		lines.forEach((line, index) => {
			if (line.trim().startsWith("```")) {
				const matchResult = regex.exec(line.trim());
				if (matchResult) {
					if (blockContent.length > 0) {
						const block = blockContent.join("\n");
						codeBlocks.push(new StandardCodeBlock(language, lastBlockStartIndex, index, block));
						blockContent = [];
					}
					language = matchResult[1];
					lastBlockStartIndex = index;
				}
			} else {
				blockContent.push(line);
			}
		});

		if (blockContent.length > 0) {
			const block = blockContent.join("\n");
			codeBlocks.push(new StandardCodeBlock(language, lastBlockStartIndex, lines.length - 1, block));
		}

		// filter by language
		if (language !== "") {
			codeBlocks = codeBlocks.filter(block => block.language === language);
			if (codeBlocks.length > 0) {
				const block = codeBlocks[codeBlocks.length - 1];
				return new StreamingMarkdownCodeBlock(block.language, block.code, false, block.startLine, block.endLine);
			}
		}

		// split content by code block from last match line to end
		const block = lines.slice(lastBlockStartIndex).join("\n");
		return StreamingMarkdownCodeBlock.parse(block);
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
			return new StreamingMarkdownCodeBlock("markdown", content.replace(/\\n/g, "\n"), codeClosed, startIndex, endIndex);
		}

		if (languageId === "devin" || languageId === "devins") {
			trimmedCode = trimmedCode.replace(/\\`\\`\\`/g, "```");
		}

		return new StreamingMarkdownCodeBlock(language, trimmedCode, codeClosed, startIndex, endIndex);
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
			case "objective-c":
				fixedLanguage = "objectivec";
				break;
			case "shell":
				fixedLanguage = "bash";
				break;
			default:
				break;
		}

		const registeredLanguages = SUPPORTED_LANGUAGES.filter(lang => lang);
		return registeredLanguages.find(lang => lang.toLowerCase() === fixedLanguage.toLowerCase()) || "markdown";
	}
}

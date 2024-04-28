import { ChunkWithoutID } from "../../code-search/chunk/Chunk";

const Parser = require("web-tree-sitter");
import { parsedCodeChunker } from "../../code-search/chunk/CodeChunker";
import { JavaLangConfig } from "../../code-context/java/JavaLangConfig";
import { TestLanguageService } from "../TestLanguageService";

describe('CodeChunk for Java', () => {
	let parser: any;

	beforeEach(async () => {
		await Parser.init();
		parser = new Parser();

		const languageService = new TestLanguageService(parser);
		const language = await JavaLangConfig.grammar(languageService, "java")!!;
		parser.setLanguage(language);
	});

	it('should success', async () => {
		let codeChunker: AsyncGenerator<ChunkWithoutID> = parsedCodeChunker(parser, "public class HelloWorld { }", 100);
		const results = [];

		for await (let chunk of codeChunker) {
			results.push(chunk);
		}

		expect(results.length).toBe(1);
		expect(results[0].content).toBe("public class HelloWorld { }");
	});
});

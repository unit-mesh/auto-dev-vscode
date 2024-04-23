import { expect } from "vitest";

const Parser = require("web-tree-sitter");

import { JavaLangConfig } from "../code-context/java/JavaLangConfig";
import { TestLanguageService } from "./TestLanguageService";
import { SyntaxNodeUtil } from "../editor/document/SyntaxNodeUtil";

describe('BlockBuilder for Java', () => {
	let parser: any;
	let language: any;
	let langConfig = JavaLangConfig;

	beforeEach(async () => {
		await Parser.init();
		parser = new Parser();
		const languageService = new TestLanguageService(parser);

		language = await JavaLangConfig.grammar(languageService, "java")!!;
		parser.setLanguage(language);
		parser.setLogger(null);
	});

	it('build for scope', async () => {
		const sourceCode = `
/**
 * This is a comment of Class Level.
 */
class HelloWorld {
		/**
		 * This is a method comment
		 */
    public static void main(string[] args) {
        System.Out.Println("Hello " + args[0]);
    }
}
`;

		let tree = parser.parse(sourceCode);

		const query = language.query(langConfig.methodQuery.queryStr);
		const root = tree.rootNode;
		const matches = query?.matches(root);

		const blockNode = matches[0].captures[0].node;

		let commentNode = SyntaxNodeUtil.previousNodes(blockNode, ['block_comment', 'line_comment']);

		expect(commentNode.length).toBe(1);
		expect(commentNode[0].text).includes("This is a method comment");
	});
});
const Parser = require("web-tree-sitter");

import { TestLanguageService } from "../../TestLanguageService";
import { TreeSitterUtil } from "../../../code-context/ast/TreeSitterUtil";
import { LanguageProfileUtil } from "../../../code-context/_base/LanguageProfile";

describe('BlockBuilder for Java', () => {
	let parser: any;
	let language: any;
	let langConfig = LanguageProfileUtil.from("java")!!

	beforeEach(async () => {
		await Parser.init();
		parser = new Parser();
		const languageService = new TestLanguageService(parser);

		language = await langConfig.grammar(languageService, "java")!!;
		parser.setLanguage(language);
	});

	it('build for node', async () => {
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

		const query = langConfig.methodQuery.query(language);

		const root = tree.rootNode;
		const matches = query?.matches(root);

		const blockNode = matches[0].captures[0].node;

		let commentNode = TreeSitterUtil.previousNodesOfType(blockNode, ['block_comment', 'line_comment']);

		expect(commentNode.length).toBe(1);
		expect(commentNode[0].text).includes("This is a method comment");
	});
});
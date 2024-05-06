import { TSLanguageUtil } from "../../../code-context/ast/TSLanguageUtil";

const Parser = require("web-tree-sitter");

import { TestLanguageService } from "../../TestLanguageService";
import { TreeSitterUtil } from "../../../code-context/ast/TreeSitterUtil";

describe('BlockBuilder for Java', () => {
	let parser: any;
	let language: any;
	let langConfig = TSLanguageUtil.for("java")!!

	beforeEach(async () => {
		await Parser.init();
		parser = new Parser();
		const languageService = new TestLanguageService(parser);

		language = await langConfig.grammar(languageService, "java")!!;
		parser.setLanguage(language);
		parser.setLogger(null);
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

		const query = language.query(langConfig.methodQuery.queryStr);
		const root = tree.rootNode;
		const matches = query?.matches(root);

		const blockNode = matches[0].captures[0].node;

		let commentNode = TreeSitterUtil.previousNodesOfType(blockNode, ['block_comment', 'line_comment']);

		expect(commentNode.length).toBe(1);
		expect(commentNode[0].text).includes("This is a method comment");
	});
});
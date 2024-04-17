const Parser = require("web-tree-sitter");

import { ScopeBuilder } from "../codesearch/ScopeBuilder";
import { JavaLangConfig } from "../codecontext/java/JavaLangConfig";
import { TestLanguageService } from "./TestLanguageService";

describe('ScopeBuilder for Java', () => {
	let parser: any;
	let grammar: any;

	beforeEach(async () => {
		await Parser.init();
		parser = new Parser();
		const languageService = new TestLanguageService(parser);

		grammar = await JavaLangConfig.grammar(languageService, "java")!!;
		parser.setLanguage(grammar);
		parser.setLogger(null);
	});

	it('build for scope', async () => {
		const javaHelloWorld = `
class HelloWorld {
    public static void main(string[] args) {
        System.Out.Println("Hello " + args[0]);
    }
}
`;

		parser.setTimeoutMicros(10 ** 6);
		const rootNode = parser.parse(javaHelloWorld).rootNode;
		const query = grammar.query(JavaLangConfig.scopeQuery.queryStr);
		let scopeBuilder = new ScopeBuilder(query!!, rootNode, javaHelloWorld, JavaLangConfig);
		let output = await scopeBuilder.build();

		const hoverRanges = output.hoverableRanges();
		expect(hoverRanges.length).toBe(3);

		const allText = hoverRanges.map((range) => range.text).join(", ");
		expect(allText).toBe("args, HelloWorld, main");
	});
});

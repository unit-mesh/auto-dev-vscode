import { TreeSitterFile } from "../../../code-context/ast/TreeSitterFile";

const Parser = require("web-tree-sitter");

import { ScopeBuilder } from "../../../code-search/semantic/ScopeBuilder";
import { JavaLangConfig } from "../../../code-context/java/JavaLangConfig";
import { TestLanguageService } from "../../TestLanguageService";
import { testScopes } from "../../ScopeTestUtil";
import { expect } from "vitest";

describe('ScopeBuilder for Java', () => {
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
		const javaHelloWorld = `
class HelloWorld {
    public static void main(string[] args) {
        System.Out.Println("Hello " + args[0]);
    }
}
`;

		parser.setTimeoutMicros(10 ** 6);
		const rootNode = parser.parse(javaHelloWorld).rootNode;
		const query = language.query(JavaLangConfig.scopeQuery.queryStr);
		let scopeBuilder = new ScopeBuilder(query!!, rootNode, javaHelloWorld, JavaLangConfig);
		let output = await scopeBuilder.build();

		const hoverRanges = output.hoverableRanges();
		expect(hoverRanges.length).toBe(4);

		const allText = hoverRanges.map((range) => range.getText()).join(", ");
		expect(allText).toBe("args, HelloWorld, main, args");
	});

	it('test for main scopes', async () => {
		const sourceCode = `
class HelloWorld {
    public static void main(string[] args) {
        System.Out.Println("Hello " + args[0]);
    }
}
`;

		let tree = parser.parse(sourceCode);
		const tsf = new TreeSitterFile(sourceCode, tree, langConfig, parser, language, "");
		let output = await testScopes("java", sourceCode, "", tsf);

		expect(output).toBe(`{"definitions":[{"context":"class §HelloWorld§ {","name":"HelloWorld","range":{"start":{"byte":7,"line":1,"column":6},"end":{"byte":17,"line":1,"column":16},"text":"HelloWorld"},"refs":[],"symbol":"class"}],"imports":[],"scopes":[{"definitions":[],"imports":[],"scopes":[{"definitions":[],"imports":[],"scopes":[{"definitions":[{"context":"public static void main(string[] §args§) {","name":"args","range":{"start":{"byte":57,"line":2,"column":37},"end":{"byte":61,"line":2,"column":41},"text":"args"},"refs":[{"context":"System.Out.Println(\\"Hello \\" + §args§[0]);"}],"symbol":"local"}],"imports":[],"scopes":[]}]}]}]}`);
	});
});

import { expect } from "vitest";
const Parser = require("web-tree-sitter");

import { TreeSitterFile } from "../../../code-context/ast/TreeSitterFile";
import { ScopeBuilder } from "../../../code-search/semantic/ScopeBuilder";
import { TestLanguageService } from "../../TestLanguageService";
import { testScopes } from "../../ScopeTestUtil";
import { TypeScriptLangConfig } from "../../../code-context/typescript/TypeScriptLangConfig";

describe('ScopeBuilder for TypeScript', () => {
	let parser: any;
	let language: any;
	let langConfig = TypeScriptLangConfig;

	beforeEach(async () => {
		await Parser.init();
		parser = new Parser();
		const languageService = new TestLanguageService(parser);

		language = await TypeScriptLangConfig.grammar(languageService, "java")!!;
		parser.setLanguage(language);
		parser.setLogger(null);
	});

	it('build for scope', async () => {
		const javaHelloWorld = `
import Link from "next/link"

export default function IndexPage() {
  return (
    <div>
      <Link href="/contact">
        <a>My second page</a>
      </Link>
      <Link href="/my-folder/about">
        <a>My third page</a>
      </Link>
    </div>
  )
}
`;

		parser.setTimeoutMicros(10 ** 6);
		const rootNode = parser.parse(javaHelloWorld).rootNode;
		const query = language.query(TypeScriptLangConfig.scopeQuery.queryStr);
		let scopeBuilder = new ScopeBuilder(query!!, rootNode, javaHelloWorld, TypeScriptLangConfig);
		let output = await scopeBuilder.build();

		const hoverRanges = output.hoverableRanges();
		expect(hoverRanges.length).toBe(4);

		const allText = hoverRanges.map((range) => range.getText()).join(", ");
		expect(allText).toBe("Link, IndexPage, href, href");
	});

	it('test for main scopes', async () => {
		const sourceCode = `
import Link from "next/link"

export default function IndexPage() {
  return (
    <div>
      <Link href="/contact">
        <a>My second page</a>
      </Link>
      <Link href="/my-folder/about">
        <a>My third page</a>
      </Link>
    </div>
  )
}
`;

		let tree = parser.parse(sourceCode);
		const tsf = new TreeSitterFile(sourceCode, tree, langConfig, parser, language, "");
		let scopeGraph = await tsf.scopeGraph();
		const imports = scopeGraph.allImports(sourceCode);

		expect(imports.length).toBe(1);
		expect(imports[0]).toBe('import Link from "next/link"');
	});
});

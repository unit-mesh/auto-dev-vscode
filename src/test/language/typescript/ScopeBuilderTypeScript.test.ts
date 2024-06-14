import { LanguageProfileUtil } from '../../../code-context/_base/LanguageProfile';
import { TreeSitterFile } from '../../../code-context/ast/TreeSitterFile';
import { ScopeBuilder } from '../../../code-search/scope-graph/ScopeBuilder';
import { TestLanguageServiceProvider } from '../../../test/TestLanguageService';

const Parser = require('web-tree-sitter');

describe('ScopeBuilder for TypeScript', () => {
	let parser: any;
	let language: any;
	let langConfig = LanguageProfileUtil.from('typescript')!!;

	beforeEach(async () => {
		await Parser.init();
		parser = new Parser();
		const languageService = new TestLanguageServiceProvider(parser);

		language = await langConfig.grammar(languageService, 'java')!!;
		parser.setLanguage(language);
		parser.setLogger(null);
	});

	it('build for node', async () => {
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
		const query = langConfig.scopeQuery.query(language);
		let scopeBuilder = new ScopeBuilder(query!!, rootNode, javaHelloWorld, langConfig);
		let output = await scopeBuilder.build();

		const hoverRanges = output.hoverableRanges();
		expect(hoverRanges.length).toBe(5);

		const allText = hoverRanges.map(range => range.getText()).join(', ');
		expect(allText).toBe('Link, IndexPage, href, href, Link');
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
		const tsf = new TreeSitterFile(sourceCode, tree, langConfig, parser, language, '');
		let scopeGraph = await tsf.scopeGraph();
		const imports = scopeGraph.allImportsBySource(sourceCode);

		expect(imports.length).toBe(1);
		expect(imports[0]).toBe('import Link from "next/link"');
	});
});

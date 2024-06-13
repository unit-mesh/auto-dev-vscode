import { expect } from 'vitest';

import { LanguageProfileUtil } from '../../../code-context/_base/LanguageProfile';
import { TreeSitterFile } from '../../../code-context/ast/TreeSitterFile';
import { ScopeBuilder } from '../../../code-search/scope-graph/ScopeBuilder';
import { testScopes } from '../../ScopeTestUtil';
import { TestLanguageServiceProvider } from '../../../test/TestLanguageService';
import { ILanguageServiceProvider } from 'base/common/languages/languageService';

const Parser = require('web-tree-sitter');

describe('ScopeBuilderGo', () => {
	let parser: any;
	let language: any;
	let langConfig = LanguageProfileUtil.from('go')!!;
	let languageService: ILanguageServiceProvider;

	beforeEach(async () => {
		await Parser.init();
		parser = new Parser();
		languageService = new TestLanguageServiceProvider(parser);

		language = await langConfig.grammar(languageService, 'go')!!;
		parser.setLanguage(language);
		parser.setLogger(null);
	});

	it('build for node', async () => {
		const sourceCode = `
package main

const one uint64 = 1
const (
    two = 2
    three = 2
)

func four() {}

var five = 3

func six() {
    seven: for ;; {}
}

type eight struct {
    nine string
    ten uint64
}

type eleven interface {}
`;

		parser.setTimeoutMicros(10 ** 6);
		let tree = parser.parse(sourceCode);
		const rootNode = tree.rootNode;
		const query = langConfig.scopeQuery.query(language);
		let scopeBuilder = new ScopeBuilder(query!!, rootNode, sourceCode, langConfig);
		let output = await scopeBuilder.build();

		const hoverRanges = output.hoverableRanges();
		expect(hoverRanges.length).toBe(11);

		const allText = hoverRanges.map(range => range.getText()).join(', ');
		expect(allText).toBe('one, two, three, five, four, six, eight, eleven, nine, ten, seven');
	});

	it('test for main scopes', async () => {
		const sourceCode = `
func main() {
    var args = os.Args;
    var length = len(args);
    fmt.Printf("%d", l);
}
`;
		let tree = parser.parse(sourceCode);
		const tsf = new TreeSitterFile(sourceCode, tree, langConfig, parser, language, '');
		await testScopes('go', sourceCode, '', tsf);
	});
});

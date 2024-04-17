const Parser = require("web-tree-sitter");

import { GoLangConfig } from "../codecontext/go/GoLangConfig";
import { ScopeBuilder } from "../codesearch/ScopeBuilder";
import { TestLanguageService } from "./TestLanguageService";

describe('ScopeBuilderGo', () => {
	let parser: any;
	let grammar: any;
	let langConfig = GoLangConfig;

	beforeEach(async () => {
		await Parser.init();
		parser = new Parser();
		const languageService = new TestLanguageService(parser);

		grammar = await langConfig.grammar(languageService, "go")!!;
		parser.setLanguage(grammar);
		parser.setLogger(null);
	});

	it('build for scope', async () => {
		const symbolConsts = `
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
		const rootNode = parser.parse(symbolConsts).rootNode;
		const query = grammar.query(langConfig.scopeQuery.queryStr);
		let scopeBuilder = new ScopeBuilder(query!!, rootNode, symbolConsts, langConfig);
		let output = await scopeBuilder.build();
		console.log(output);
	});
});

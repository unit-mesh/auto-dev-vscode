import { SyntaxNode } from 'web-tree-sitter';

import { LanguageProfileUtil } from '../../../code-context/_base/LanguageProfile';
import { TestLanguageServiceProvider } from '../../../test/TestLanguageService';

const Parser = require('web-tree-sitter');

describe('TypeScriptLangConfig', () => {
	let parser: any;
	let grammar: any;
	let langConfig = LanguageProfileUtil.from('typescript')!!;

	beforeEach(async () => {
		await Parser.init();
		parser = new Parser();
		const languageService = new TestLanguageServiceProvider(parser);
		grammar = await langConfig.grammar(languageService, 'typescript')!!;
		parser.setLanguage(grammar);
	});

	it('should identify methods of TypeScript', async () => {
		const sampleCode = `function hello() {
  console.log("hello, world");
}

class Greeter {
  greeting: string;

  constructor(message: string) {
    this.greeting = message;
  }

  greet() {
    return "Hello, " + this.greeting;
  }
}
`;

		const query = langConfig.methodQuery.query(grammar);
		const root = parser.parse(sampleCode).rootNode;
		const matches = query!!.matches(root);

		expect(matches).toBeDefined();
		expect(matches.length).toBe(3);

		const bodyNodes: SyntaxNode[] = matches.map((match: any) => match.captures[0].node);
		expect(bodyNodes[0].text).toBe('function hello() {\n  console.log("hello, world");\n}');
		expect(bodyNodes[1].text).toBe('constructor(message: string) {\n    this.greeting = message;\n  }');
		expect(bodyNodes[2].text).toBe('greet() {\n    return "Hello, " + this.greeting;\n  }');

		const methodNameNodes: SyntaxNode[] = matches.map((match: any) => match.captures[1].node);
		expect(methodNameNodes[0].text).toBe('hello');
		expect(methodNameNodes[1].text).toBe('constructor');
		expect(methodNameNodes[2].text).toBe('greet');
	});
});

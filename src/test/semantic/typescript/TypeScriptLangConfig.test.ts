import { SyntaxNode } from "web-tree-sitter";

const Parser = require("web-tree-sitter");
import { TestLanguageService } from "../../TestLanguageService";
import { TypeScriptLangConfig } from "../../../semantic/typescript/TypeScriptLangConfig";

describe('TypeScriptLangConfig', () => {
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

		await Parser.init();
		const parser = new Parser();
		const languageService = new TestLanguageService(parser);

		let grammar = await TypeScriptLangConfig.grammar(languageService, "typescript")!!;
		parser.setLanguage(grammar);


		const query = grammar!!.query(TypeScriptLangConfig.methodQuery.scopeQuery);
		const root = parser.parse(sampleCode).rootNode;
		const matches = query!!.matches(root);

		expect(matches).toBeDefined();
		expect(matches.length).toBe(3);

		const nodes: SyntaxNode[] = matches.map((match: any) => match.captures[0].node);
		expect(nodes[0].text).toBe("function hello() {\n  console.log(\"hello, world\");\n}");
		expect(nodes[1].text).toBe("constructor(message: string) {\n    this.greeting = message;\n  }");
		expect(nodes[2].text).toBe("greet() {\n    return \"Hello, \" + this.greeting;\n  }");
	});
});
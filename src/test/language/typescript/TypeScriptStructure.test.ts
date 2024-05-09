import { TreeSitterFile } from "../../../code-context/ast/TreeSitterFile";

const Parser = require("web-tree-sitter");
import "reflect-metadata";

import { TestLanguageService } from "../../TestLanguageService";
import { TypeScriptStructurer } from "../../../code-context/typescript/TypeScriptStructurer";
import { LanguageProfileUtil } from "../../../code-context/_base/LanguageProfile";

describe('JavaStructure', () => {
	it('should convert a simple file to CodeFile', async () => {
		const typeScriptClass = `
interface LabeledValue {
  label: string;
}
`;

		await Parser.init();
		const parser = new Parser();
		let languageService = new TestLanguageService(new Parser());

		const structurer = new TypeScriptStructurer();
		await structurer.init(languageService);

		let langConfig = LanguageProfileUtil.from("typescript")!!;
		const language = await langConfig.grammar(languageService, "typescript")!!;
		parser.setLanguage(language);

		let tree = parser.parse(typeScriptClass);
		// walk tree.rootNode for list all node name
	  let cursor = tree.walk();
	  let nodeNames = [];
	  cursor.gotoFirstChild();
	  do {
	    nodeNames.push(cursor.nodeType);
	  } while (cursor.gotoNextSibling());

		console.log(nodeNames);

		const codeFile = await structurer.parseFile(typeScriptClass, "");
		// console.log(codeFile);
	});
});
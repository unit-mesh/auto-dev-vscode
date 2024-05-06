import { printScopeGraph } from "../../ScopeTestUtil";

const Parser = require("web-tree-sitter");
import 'reflect-metadata';

import { GoLangConfig } from "../../../code-context/go/GoLangConfig";
import { TreeSitterFile } from "../../../code-context/ast/TreeSitterFile";
import { TestLanguageService } from "../../TestLanguageService";
import { ScopeGraph } from "../../../code-search/scope-graph/ScopeGraph";
import { functionToRange } from "../../../editor/codemodel/CodeElement";
import { GoStructurerProvider } from "../../../code-context/go/GoStructurerProvider";
import { TSLanguageUtil } from "../../../code-context/ast/TSLanguageUtil";

describe('RelevantClass for Golang', () => {
	let parser: any;
	let language: any;
	let langConfig = TSLanguageUtil.for("go")!!;

	beforeEach(async () => {
		await Parser.init();
		parser = new Parser();
		const languageService = new TestLanguageService(parser);

		language = await langConfig.grammar(languageService, "go")!!;
		parser.setLanguage(language);
		parser.setLogger(null);
	});

	it('calculate for services', async () => {
		const controller =
			`package cmd

import (
  "github.com/modernizing/coca/pkg/domain/core_domain"
)

func AnalysisJava() []core_domain.CodeDataStruct {
  var iNodes []core_domain.CodeDataStruct
	// some code
}
`;

		let tree = parser.parse(controller);
		const tsf = new TreeSitterFile(controller, tree, langConfig, parser, language, "");
		const graph: ScopeGraph = await tsf.scopeGraph();
		// printScopeGraph("go", controller, tsf);

		let structurer = new GoStructurerProvider();
		await structurer.init(new TestLanguageService(parser));

		let codeFile = await structurer.parseFile(controller, "")!!;
		let firstFunc = codeFile?.functions!![0]!!;
		let textRange = functionToRange(firstFunc);

		let ios: string[] = await structurer.retrieveMethodIOImports(graph, tsf.tree.rootNode, textRange, controller) ?? [];
		console.log(ios);

		// expect(ios).toEqual([
		// 	'import cc.unitmesh.untitled.demo.entity.BlogPost;',
		// 	'import org.springframework.web.bind.annotation.PathVariable;'
		// ]);
		//
	});
});

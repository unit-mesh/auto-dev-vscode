import { LanguageProfileUtil } from '../../../code-context/_base/LanguageProfile';
import { TreeSitterFile } from '../../../code-context/ast/TreeSitterFile';
import { GoStructurerProvider } from '../../../code-context/go/GoStructurerProvider';
import { ScopeGraph } from '../../../code-search/scope-graph/ScopeGraph';
import { functionToRange } from '../../../editor/codemodel/CodeElement';
import { TestLanguageServiceProvider } from '../../../test/TestLanguageService';

const Parser = require('web-tree-sitter');

describe('RelevantClass for Golang', () => {
	let parser: any;
	let language: any;
	let langConfig = LanguageProfileUtil.from('go')!!;

	beforeEach(async () => {
		await Parser.init();
		parser = new Parser();
		const languageService = new TestLanguageServiceProvider(parser);

		language = await langConfig.grammar(languageService, 'go')!!;
		parser.setLanguage(language);
		parser.setLogger(null);
	});

	it('calculate for services', async () => {
		const controller = `package cmd

import (
  "github.com/modernizing/coca/pkg/domain/core_domain"
)

func AnalysisJava() []core_domain.CodeDataStruct {
  var iNodes []core_domain.CodeDataStruct
	// some code
}
`;

		let tree = parser.parse(controller);
		const tsf = new TreeSitterFile(controller, tree, langConfig, parser, language, '');
		const graph: ScopeGraph = await tsf.scopeGraph();
		// printScopeGraph("go", controller, tsf);

		let structurer = new GoStructurerProvider();
		await structurer.init(new TestLanguageServiceProvider(parser));

		let codeFile = await structurer.parseFile(controller, '')!!;
		let firstFunc = codeFile?.functions!![0]!!;
		let textRange = functionToRange(firstFunc);

		let ios: string[] =
			(await structurer.retrieveMethodIOImports(graph, tsf.tree.rootNode, textRange, controller)) ?? [];
		console.log(ios);

		// expect(ios).toEqual([
		// 	'import cc.unitmesh.untitled.demo.entity.BlogPost;',
		// 	'import org.springframework.web.bind.annotation.PathVariable;'
		// ]);
		//
	});
});

import { TreeSitterFile } from "../code-context/ast/TreeSitterFile";

import { TSLanguageUtil } from "../code-context/ast/TreeSitterWrapper";

export async function testScopes(langId: string, src: string, expected: string, tsfFile: TreeSitterFile) {
	const graph = await tsfFile.scopeGraph();
	const language = TSLanguageUtil.for(langId)!!;
	const observed = graph.debug(src, language);
	return observed.toString();
}

export async function printScopeGraph(langId: string, src: string, tsfFile: TreeSitterFile) {
	const graph = await tsfFile.scopeGraph();
	const language = TSLanguageUtil.for(langId)!!;
	console.log(graph.debug(src, language).toString());
}


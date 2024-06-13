import { LanguageProfileUtil } from '../code-context/_base/LanguageProfile';
import { TreeSitterFile } from '../code-context/ast/TreeSitterFile';

export async function testScopes(langId: string, src: string, expected: string, tsfFile: TreeSitterFile) {
	const graph = await tsfFile.scopeGraph();
	const language = LanguageProfileUtil.from(langId)!!;
	const observed = graph.debug(src, language);
	return observed.toString();
}

export async function printScopeGraph(langId: string, src: string, tsfFile: TreeSitterFile) {
	const graph = await tsfFile.scopeGraph();
	const language = LanguageProfileUtil.from(langId)!!;
	console.log(graph.debug(src, language).toString());
}

import { TreeSitterFile } from "../codecontext/TreeSitterFile";
import { TSLanguageUtil } from "../codecontext/TSLanguageUtil";

export async function testScopes(langId: string, src: string, expected: string) {
	const graph = await buildGraph(langId, src);
	const language = TSLanguageUtil.fromId(langId)!!;
	const observed = graph.debug(src, language);
	expect(observed).toEqual(expected);
}

export async function buildGraph(langId: string, src: string) {
	const tsf = await TreeSitterFile.tryBuild(src, langId);
	return tsf.scopeGraph();
}

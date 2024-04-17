import path from "path";
import { TreeSitterFile } from "../codecontext/TreeSitterFile";
import { TSLanguageUtil } from "../codecontext/TSLanguageUtil";

export const ROOT_DIR = path.join(
	__dirname,
	"..",
	"..",
)

export async function testScopes(langId: string, src: string, expected: string) {
	var graph = await buildGraph(langId, src);
	var language = TSLanguageUtil.fromId(langId)!!;
	// var observed = graph.debug(src, language);
	// expect(observed).toEqual(expected);
}

export async function buildGraph(langId: string, src: string) {
	const tsf = await TreeSitterFile.tryBuild(src, langId);
	return tsf.scopeGraph();
}

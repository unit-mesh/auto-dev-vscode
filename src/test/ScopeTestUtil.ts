import { TreeSitterFile } from "../codecontext/TreeSitterFile";
import { TSLanguageUtil } from "../codecontext/TSLanguageUtil";

export async function testScopes(langId: string, src: string, expected: string, tsfFile: TreeSitterFile) {
	const graph = await tsfFile.scopeGraph();
	const language = TSLanguageUtil.fromId(langId)!!;
	const observed = graph.debug(src, language);
	console.log(observed.toString());
}

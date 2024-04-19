import { TreeSitterFile } from "../code-context/ast/TreeSitterFile";
import { TSLanguageUtil } from "../code-context/ast/TSLanguageUtil";

export async function testScopes(langId: string, src: string, expected: string, tsfFile: TreeSitterFile) {
	const graph = await tsfFile.scopeGraph();
	const language = TSLanguageUtil.fromId(langId)!!;
	const observed = graph.debug(src, language);
	return observed.toString();
}

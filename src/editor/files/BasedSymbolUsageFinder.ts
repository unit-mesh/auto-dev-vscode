import vscode from "vscode";
import { ISymbolInformation } from "../language/base/languages";
import { normalizeTreeSitterRange } from "../language/base/range";
import { getImportedSymbols } from "../language/base/documentSymbol";
import { parse } from "../language/parser/TreeSitterParser";

export class BasedSymbolUsageFinder {
	async findImportedSymbols(path: string): Promise<ISymbolInformation[]> {
		const doc = await vscode.workspace.openTextDocument(path);
		const tree = await parse(doc.uri, doc.languageId, doc.getText()).catch(
			() => void 0
		);

		if (!tree) return [];

		const importedSymbols = await getImportedSymbols(path, tree);

		return importedSymbols.map((node) => ({
			name: node.text,
			range: normalizeTreeSitterRange(node.startPosition, node.endPosition),
			startOffset: node.startIndex,
			endOffset: node.endIndex,
		}));
	}
}

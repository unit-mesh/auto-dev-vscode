import * as vscode from "vscode";
import TreeSitter from "web-tree-sitter";

import { IPosition } from "./languages";
import { isInRange } from "./range";
import { inferLanguage } from "../SupportedLanguage";

export function isDocumentSymbol(
	symbol: vscode.DocumentSymbol | vscode.SymbolInformation
): symbol is vscode.DocumentSymbol {
	return undefined !== (symbol as vscode.DocumentSymbol).children;
}

export function getDocumentSymbol(
	symbols: vscode.DocumentSymbol[] | vscode.SymbolInformation[],
	pos: vscode.Position | IPosition
): vscode.DocumentSymbol | undefined {
	for (const symbol of symbols) {
		if (!isDocumentSymbol(symbol)) return;

		if (isInRange(pos, symbol.range)) {
			return getDocumentSymbol(symbol.children, pos) || symbol;
		}
	}
}

export async function getImportedSymbols(
	filename: string,
	tree: TreeSitter.Tree
): Promise<TreeSitter.SyntaxNode[]> {
	if ("python" === inferLanguage(filename)) {
		return tree.rootNode
			.descendantsOfType("import_from_statement")
			.flatMap((node) => {
				const index = node.children.findIndex(
					(child) => "import" === child.type
				);
				return index > 0
					? node.children
							.slice(index + 1)
							.filter((node) => "dotted_name" === node.type)
					: [];
			});
	}

	return [];
}

import vscode from "vscode";
import { TreeSitterFile } from "./TreeSitterFile";
import { DefaultLanguageService } from "../../editor/language/service/DefaultLanguageService";
import Parser, { Language, SyntaxNode } from "web-tree-sitter";

/**
 * Converts a given VSCode text document into a TreeSitterFile.
 *
 * @param document The VSCode text document to convert.
 * @returns The TreeSitterFile representation of the document, or null if the conversion fails.
 */
export async function documentToTreeSitterFile(document: vscode.TextDocument) {
	const cached = TreeSitterFile.cache.getDocument(document.uri, document.version);
	if (cached) {
		return cached;
	}

	const src = document.getText();
	const langId = document.languageId;

	const file = await TreeSitterFile.tryBuild(src, langId, new DefaultLanguageService());
	TreeSitterFile.cache.setDocument(document.uri, document.version, file);
	return file;
}

export function isTopLevelNode(node: SyntaxNode) : boolean {
	const rootNode = node.tree.rootNode;
	if (node === rootNode) {
		return true;
	}

	const parent = node.parent;
	if (!parent) {
		return false;
	}

	const grandParent = parent.parent;
	if (!grandParent || grandParent === rootNode) {
		return true;
	}

	return false;
}

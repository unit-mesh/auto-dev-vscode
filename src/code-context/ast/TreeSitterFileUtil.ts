import vscode from "vscode";
import { TreeSitterFile } from "./TreeSitterFile";
import { DefaultLanguageService } from "../../editor/language/service/DefaultLanguageService";
import { NamedElementBuilder } from "../../editor/ast/NamedElementBuilder";

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

export async  function stringToTree(content: string, langId: string) {
	return await TreeSitterFile.tryBuild(content, langId, new DefaultLanguageService());
}

export async function toNamedElementBuilder(document: vscode.TextDocument): Promise<NamedElementBuilder> {
	let file = await documentToTreeSitterFile(document);
	return new NamedElementBuilder(file);
}

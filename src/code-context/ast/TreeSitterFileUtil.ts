import vscode from "vscode";
import { TreeSitterFile } from "./TreeSitterFile";
import { DefaultLanguageService } from "../../editor/language/service/DefaultLanguageService";
import { NamedElementBuilder } from "../../editor/ast/NamedElementBuilder";
import { TreeSitterFileCacheManager } from "../../editor/cache/TreeSitterFileCacheManager";

/**
 * Converts a given VSCode {@link TextDocument} into a TreeSitterFile.
 *
 * @param document The VSCode {@link TextDocument} to convert.
 * @returns The TreeSitterFile representation of the document, or null if the conversion fails.
 */
export async function documentToTreeSitterFile(document: vscode.TextDocument) {
	const cached = TreeSitterFileCacheManager.getInstance().getDocument(document.uri, document.version);
	if (cached) {
		return cached;
	}

	const src = document.getText();
	const langId = document.languageId;

	const file = await TreeSitterFile.create(src, langId, new DefaultLanguageService(), document.uri.fsPath);
	TreeSitterFileCacheManager.getInstance().setDocument(document.uri, document.version, file);
	return file;
}

export async function toNamedElementBuilder(document: vscode.TextDocument): Promise<NamedElementBuilder> {
	let file = await documentToTreeSitterFile(document);
	return new NamedElementBuilder(file);
}
